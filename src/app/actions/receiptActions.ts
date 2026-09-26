"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateDocumentNumber } from "@/lib/documentNumber";
import { notifyManagersAndAdmin } from "@/lib/notifications";
import { revalidatePath } from "next/cache";

export async function createReceiptAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Authentication required to create receipts." };
    }

    const supplierId = formData.get("supplierId") as string;
    const warehouseId = formData.get("warehouseId") as string;
    const locationId = formData.get("locationId") as string;
    const productId = formData.get("productId") as string;
    const quantity = parseInt((formData.get("quantity") as string) || "1", 10);
    const notes = (formData.get("notes") as string) || null;

    if (!supplierId || !warehouseId || !locationId || !productId || quantity <= 0) {
      return { success: false, error: "Please enter valid receipt details and quantity > 0." };
    }

    const receiptNo = await generateDocumentNumber("REC");

    await prisma.receipt.create({
      data: {
        receiptNo,
        supplierId,
        warehouseId,
        status: "READY",
        notes,
        createdById: user.id,
        items: {
          create: [
            {
              productId,
              locationId,
              quantity,
            },
          ],
        },
      },
    });

    revalidatePath("/operations/receipts");
    revalidatePath("/dashboard");
    return { success: true, receiptNo };
  } catch (error: any) {
    console.error("Create receipt failed:", error);
    return { success: false, error: error.message || "Failed to create receipt." };
  }
}

export async function validateReceiptAction(receiptId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Authentication required to validate receipts." };
    }

    // Execute atomic transaction for inventory & ledger
    const result = await prisma.$transaction(async (tx) => {
      const receipt = await tx.receipt.findUnique({
        where: { id: receiptId },
        include: { items: { include: { product: true } } },
      });

      if (!receipt) throw new Error("Receipt document not found.");
      if (receipt.status === "DONE") throw new Error("Receipt has already been validated.");

      // For each item, update inventory and add to ledger
      for (const item of receipt.items) {
        // Find existing inventory in destination location
        const existingInv = await tx.inventory.findUnique({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: item.locationId,
            },
          },
        });

        const beforeQty = existingInv ? existingInv.quantity : 0;
        const afterQty = beforeQty + item.quantity;

        // Upsert inventory
        await tx.inventory.upsert({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: item.locationId,
            },
          },
          update: { quantity: afterQty },
          create: {
            productId: item.productId,
            locationId: item.locationId,
            warehouseId: receipt.warehouseId,
            quantity: afterQty,
          },
        });

        // Create immutable StockLedger entry
        await tx.stockLedger.create({
          data: {
            productId: item.productId,
            warehouseId: receipt.warehouseId,
            locationId: item.locationId,
            movementType: "RECEIPT",
            quantity: item.quantity,
            beforeQuantity: beforeQty,
            afterQuantity: afterQty,
            referenceType: "RECEIPT",
            referenceId: receipt.receiptNo,
            reason: `Inward receipt validation from supplier (${receipt.receiptNo})`,
            userId: user.id,
          },
        });
      }

      // Mark receipt as DONE
      await tx.receipt.update({
        where: { id: receiptId },
        data: { status: "DONE" },
      });

      // Add audit log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "VALIDATE_RECEIPT",
          entity: "Receipt",
          entityId: receipt.id,
          metadata: { receiptNo: receipt.receiptNo, itemsCount: receipt.items.length },
        },
      });

      return receipt;
    });

    await notifyManagersAndAdmin({
      title: "Inward Receipt Validated",
      message: `Receipt ${result.receiptNo} successfully validated by ${user.name}.`,
      type: "RECEIPT_VALIDATED",
    });

    revalidatePath("/operations/receipts");
    revalidatePath("/products");
    revalidatePath("/dashboard");
    revalidatePath("/operations/move-history");

    return { success: true };
  } catch (error: any) {
    console.error("Validate receipt failed:", error);
    return { success: false, error: error.message || "Failed to validate receipt." };
  }
}
