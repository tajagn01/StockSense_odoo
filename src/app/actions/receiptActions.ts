"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { canCreateReceipt, canValidateReceipt, assertPermission } from "@/lib/permissions";
import { generateDocumentNumber } from "@/lib/documentNumber";
import { incrementInventoryAtomic } from "@/lib/inventory";
import { notifyManagersAndAdmin } from "@/lib/notifications";
import { safeRevalidatePath } from "@/lib/serverUtils";

export async function createReceiptAction(formData: FormData) {
  try {
    const user = await requireAuth();
    assertPermission(user.role, canCreateReceipt, "create receipt orders");

    const supplierId = (formData.get("supplierId") as string)?.trim();
    const warehouseId = (formData.get("warehouseId") as string)?.trim();
    const locationId = (formData.get("locationId") as string)?.trim();
    const productId = (formData.get("productId") as string)?.trim();
    const quantityStr = (formData.get("quantity") as string)?.trim();
    const notes = (formData.get("notes") as string)?.trim() || null;

    if (!supplierId || !warehouseId || !locationId || !productId) {
      return { success: false, error: "Supplier, warehouse, location, and product are required." };
    }

    // Strict integer validation: reject floats, strings like '10abc', negatives, zero
    if (!quantityStr || !/^\d+$/.test(quantityStr)) {
      return { success: false, error: "Receipt quantity must be a strictly positive whole integer." };
    }
    const quantity = parseInt(quantityStr, 10);
    if (quantity <= 0 || !Number.isSafeInteger(quantity)) {
      return { success: false, error: "Receipt quantity must be greater than zero." };
    }

    // Validate relationships and existence
    const [supplier, warehouse, location, product] = await Promise.all([
      prisma.supplier.findUnique({ where: { id: supplierId } }),
      prisma.warehouse.findUnique({ where: { id: warehouseId } }),
      prisma.location.findUnique({ where: { id: locationId } }),
      prisma.product.findUnique({ where: { id: productId } }),
    ]);

    if (!supplier) return { success: false, error: "Selected supplier does not exist." };
    if (!warehouse || !warehouse.isActive) return { success: false, error: "Selected warehouse is invalid or inactive." };
    if (!location) return { success: false, error: "Selected warehouse location does not exist." };
    if (location.warehouseId !== warehouseId) {
      return { success: false, error: "The selected location does not belong to the selected warehouse." };
    }
    if (!product || !product.isActive) return { success: false, error: "Selected product is invalid or inactive." };

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

    safeRevalidatePath("/operations/receipts");
    safeRevalidatePath("/dashboard");
    return { success: true, receiptNo };
  } catch (error: any) {
    console.error("Create receipt failed:", error);
    return { success: false, error: error.message || "Failed to create receipt. Please verify details." };
  }
}

export async function validateReceiptAction(receiptId: string) {
  try {
    const user = await requireAuth();
    assertPermission(user.role, canValidateReceipt, "validate and accept inward receipts");

    if (!receiptId) {
      return { success: false, error: "Receipt ID is required." };
    }

    // Execute atomic transaction for state transition, inventory increment, ledger, and audit
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch receipt with items
      const receipt = await tx.receipt.findUnique({
        where: { id: receiptId },
        include: { items: { include: { product: true } } },
      });

      if (!receipt) throw new Error("Receipt document not found.");

      // 2. Concurrency-safe atomic state transition: prevent double validation
      const updatedReceipt = await tx.receipt.updateMany({
        where: {
          id: receiptId,
          status: { in: ["READY", "DRAFT"] },
        },
        data: { status: "DONE" },
      });

      if (updatedReceipt.count === 0) {
        throw new Error("Receipt has already been validated or is not in a valid state for processing.");
      }

      // 3. For each item, atomically update inventory using PostgreSQL RETURNING and record exact ledger
      for (const item of receipt.items) {
        const mutation = await incrementInventoryAtomic(tx, {
          productId: item.productId,
          warehouseId: receipt.warehouseId,
          locationId: item.locationId,
          quantity: item.quantity,
        });

        // Immutable StockLedger entry with exact mutation values
        await tx.stockLedger.create({
          data: {
            productId: item.productId,
            warehouseId: receipt.warehouseId,
            locationId: item.locationId,
            movementType: "RECEIPT",
            quantity: item.quantity,
            beforeQuantity: mutation.beforeQuantity,
            afterQuantity: mutation.afterQuantity,
            referenceType: "RECEIPT",
            referenceId: receipt.receiptNo,
            reason: `Inward receipt validation from supplier (${receipt.receiptNo})`,
            userId: user.id,
          },
        });
      }

      // 4. Audit Log
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
    }, { maxWait: 15000, timeout: 30000 });

    await notifyManagersAndAdmin({
      title: "Inward Receipt Validated",
      message: `Receipt ${result.receiptNo} successfully validated by ${user.name}.`,
      type: "RECEIPT_VALIDATED",
    });

    safeRevalidatePath("/operations/receipts");
    safeRevalidatePath("/products");
    safeRevalidatePath("/dashboard");
    safeRevalidatePath("/operations/move-history");

    return { success: true };
  } catch (error: any) {
    console.error("Validate receipt failed:", error);
    return { success: false, error: error.message || "Failed to validate receipt." };
  }
}
