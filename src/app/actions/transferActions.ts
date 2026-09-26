"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { canCreateTransfer, canValidateTransfer, assertPermission } from "@/lib/permissions";
import { generateDocumentNumber } from "@/lib/documentNumber";
import { incrementInventoryAtomic, decrementInventoryAtomic } from "@/lib/inventory";
import { notifyManagersAndAdmin } from "@/lib/notifications";
import { safeRevalidatePath } from "@/lib/serverUtils";

export async function createTransferAction(formData: FormData) {
  try {
    const user = await requireAuth();
    assertPermission(user.role, canCreateTransfer, "create internal stock transfers");

    const sourceLocationId = (formData.get("sourceLocationId") as string)?.trim();
    const destinationLocationId = (formData.get("destinationLocationId") as string)?.trim();
    const productId = (formData.get("productId") as string)?.trim();
    const quantityStr = (formData.get("quantity") as string)?.trim();
    const notes = (formData.get("notes") as string)?.trim() || null;

    if (!sourceLocationId || !destinationLocationId || !productId) {
      return { success: false, error: "Source location, destination location, and product are required." };
    }

    if (!quantityStr || !/^\d+$/.test(quantityStr)) {
      return { success: false, error: "Transfer quantity must be a strictly positive whole integer." };
    }
    const quantity = parseInt(quantityStr, 10);
    if (quantity <= 0 || !Number.isSafeInteger(quantity)) {
      return { success: false, error: "Transfer quantity must be greater than zero." };
    }

    if (sourceLocationId === destinationLocationId) {
      return { success: false, error: "Source location and destination location cannot be identical." };
    }

    // Validate existence and warehouse relationships
    const [srcLoc, destLoc, product] = await Promise.all([
      prisma.location.findUnique({ where: { id: sourceLocationId }, include: { warehouse: true } }),
      prisma.location.findUnique({ where: { id: destinationLocationId }, include: { warehouse: true } }),
      prisma.product.findUnique({ where: { id: productId } }),
    ]);

    if (!srcLoc || !srcLoc.warehouse?.isActive) {
      return { success: false, error: "Source location is invalid or belongs to an inactive warehouse." };
    }
    if (!destLoc || !destLoc.warehouse?.isActive) {
      return { success: false, error: "Destination location is invalid or belongs to an inactive warehouse." };
    }
    if (!product || !product.isActive) {
      return { success: false, error: "Selected product is invalid or inactive." };
    }

    const transferNo = await generateDocumentNumber("TRF");

    await prisma.transfer.create({
      data: {
        transferNo,
        sourceWarehouseId: srcLoc.warehouseId,
        sourceLocationId: srcLoc.id,
        destinationWarehouseId: destLoc.warehouseId,
        destinationLocationId: destLoc.id,
        status: "READY",
        notes,
        createdById: user.id,
        items: {
          create: [
            {
              productId,
              quantity,
            },
          ],
        },
      },
    });

    safeRevalidatePath("/operations/transfers");
    safeRevalidatePath("/dashboard");
    return { success: true, transferNo };
  } catch (error: any) {
    console.error("Create transfer failed:", error);
    return { success: false, error: error.message || "Failed to schedule transfer." };
  }
}

export async function validateTransferAction(transferId: string) {
  try {
    const user = await requireAuth();
    assertPermission(user.role, canValidateTransfer, "validate and execute internal transfers");

    if (!transferId) return { success: false, error: "Transfer ID is required." };

    const result = await prisma.$transaction(async (tx) => {
      const transfer = await tx.transfer.findUnique({
        where: { id: transferId },
        include: { items: { include: { product: true } } },
      });

      if (!transfer) throw new Error("Transfer order not found.");

      // 1. Concurrency-safe atomic state transition: prevent double transfer
      const updatedTransfer = await tx.transfer.updateMany({
        where: { id: transferId, status: "READY" },
        data: { status: "DONE" },
      });

      if (updatedTransfer.count === 0) {
        throw new Error("Transfer has already been completed or is not in READY status.");
      }

      for (const item of transfer.items) {
        // 2. Atomic conditional decrement at source: prevents race conditions and negative inventory
        const srcMutation = await decrementInventoryAtomic(tx, {
          productId: item.productId,
          locationId: transfer.sourceLocationId,
          quantity: item.quantity,
          productName: item.product.name,
        });

        // 3. Atomic increment at destination location with exact returned state
        const destMutation = await incrementInventoryAtomic(tx, {
          productId: item.productId,
          warehouseId: transfer.destinationWarehouseId,
          locationId: transfer.destinationLocationId,
          quantity: item.quantity,
        });

        // 4. Record dual StockLedger entries (source decrement + destination increment)
        await tx.stockLedger.create({
          data: {
            productId: item.productId,
            warehouseId: transfer.sourceWarehouseId,
            locationId: transfer.sourceLocationId,
            movementType: "TRANSFER_OUT",
            quantity: -item.quantity,
            beforeQuantity: srcMutation.beforeQuantity,
            afterQuantity: srcMutation.afterQuantity,
            referenceType: "TRANSFER",
            referenceId: transfer.transferNo,
            reason: `Transfer outward to ${transfer.destinationLocationId} (${transfer.transferNo})`,
            userId: user.id,
          },
        });

        await tx.stockLedger.create({
          data: {
            productId: item.productId,
            warehouseId: transfer.destinationWarehouseId,
            locationId: transfer.destinationLocationId,
            movementType: "TRANSFER_IN",
            quantity: item.quantity,
            beforeQuantity: destMutation.beforeQuantity,
            afterQuantity: destMutation.afterQuantity,
            referenceType: "TRANSFER",
            referenceId: transfer.transferNo,
            reason: `Transfer inward from ${transfer.sourceLocationId} (${transfer.transferNo})`,
            userId: user.id,
          },
        });
      }

      // 5. Audit log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "VALIDATE_TRANSFER",
          entity: "Transfer",
          entityId: transfer.id,
          metadata: {
            transferNo: transfer.transferNo,
            sourceWarehouseId: transfer.sourceWarehouseId,
            destinationWarehouseId: transfer.destinationWarehouseId,
            itemsCount: transfer.items.length,
          },
        },
      });

      return transfer;
    }, { maxWait: 15000, timeout: 30000 });

    await notifyManagersAndAdmin({
      title: "Stock Transfer Completed",
      message: `Transfer ${result.transferNo} executed by ${user.name}.`,
      type: "TRANSFER_COMPLETED",
    });

    safeRevalidatePath("/operations/transfers");
    safeRevalidatePath("/products");
    safeRevalidatePath("/dashboard");
    safeRevalidatePath("/operations/move-history");

    return { success: true };
  } catch (error: any) {
    console.error("Validate transfer failed:", error);
    return { success: false, error: error.message || "Failed to validate transfer." };
  }
}
