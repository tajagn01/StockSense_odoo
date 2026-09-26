"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { canCreateTransfer, canValidateTransfer, assertPermission } from "@/lib/permissions";
import { generateDocumentNumber } from "@/lib/documentNumber";
import { notifyManagersAndAdmin } from "@/lib/notifications";
import { revalidatePath } from "next/cache";

export async function createTransferAction(formData: FormData) {
  try {
    const user = await requireAuth();
    assertPermission(user.role, canCreateTransfer, "create internal stock transfers");

    const sourceLocationId = formData.get("sourceLocationId") as string;
    const destinationLocationId = formData.get("destinationLocationId") as string;
    const productId = formData.get("productId") as string;
    const quantityRaw = parseInt((formData.get("quantity") as string) || "0", 10);
    const notes = (formData.get("notes") as string)?.trim() || null;

    if (!sourceLocationId || !destinationLocationId || !productId) {
      return { success: false, error: "Source location, destination location, and product are required." };
    }

    if (isNaN(quantityRaw) || quantityRaw <= 0) {
      return { success: false, error: "Transfer quantity must be a positive integer greater than zero." };
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
              quantity: quantityRaw,
            },
          ],
        },
      },
    });

    revalidatePath("/operations/transfers");
    revalidatePath("/dashboard");
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

      // 1. Concurrency-safe atomic state check & transition: prevent double transfer
      const updatedTransfer = await tx.transfer.updateMany({
        where: { id: transferId, status: "READY" },
        data: { status: "DONE" },
      });

      if (updatedTransfer.count === 0) {
        throw new Error("Transfer has already been completed or is not in READY status.");
      }

      for (const item of transfer.items) {
        // 2. Atomic conditional decrement at source: prevents race condition / negative stock
        const srcUpdate = await tx.inventory.updateMany({
          where: {
            productId: item.productId,
            locationId: transfer.sourceLocationId,
            quantity: { gte: item.quantity },
          },
          data: {
            quantity: { decrement: item.quantity },
          },
        });

        if (srcUpdate.count === 0) {
          const srcInv = await tx.inventory.findUnique({
            where: {
              productId_locationId: {
                productId: item.productId,
                locationId: transfer.sourceLocationId,
              },
            },
          });
          const available = srcInv ? srcInv.quantity : 0;
          throw new Error(
            `Insufficient stock at source location for '${item.product.name}'. Required: ${item.quantity}, Available: ${available}.`
          );
        }

        // Fetch post-decrement source quantity for ledger entry
        const updatedSrcInv = await tx.inventory.findUnique({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: transfer.sourceLocationId,
            },
          },
        });
        const srcAfter = updatedSrcInv ? updatedSrcInv.quantity : 0;
        const srcBefore = srcAfter + item.quantity;

        // 3. Atomic increment at destination location
        const destInvBefore = await tx.inventory.findUnique({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: transfer.destinationLocationId,
            },
          },
        });
        const destBefore = destInvBefore ? destInvBefore.quantity : 0;
        const destAfter = destBefore + item.quantity;

        await tx.inventory.upsert({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: transfer.destinationLocationId,
            },
          },
          update: {
            quantity: { increment: item.quantity },
          },
          create: {
            productId: item.productId,
            locationId: transfer.destinationLocationId,
            warehouseId: transfer.destinationWarehouseId,
            quantity: item.quantity,
          },
        });

        // 4. Record dual StockLedger entries (source decrement + destination increment)
        await tx.stockLedger.create({
          data: {
            productId: item.productId,
            warehouseId: transfer.sourceWarehouseId,
            locationId: transfer.sourceLocationId,
            movementType: "TRANSFER_OUT",
            quantity: -item.quantity,
            beforeQuantity: srcBefore,
            afterQuantity: srcAfter,
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
            beforeQuantity: destBefore,
            afterQuantity: destAfter,
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
    });

    await notifyManagersAndAdmin({
      title: "Stock Transfer Completed",
      message: `Transfer ${result.transferNo} executed by ${user.name}.`,
      type: "TRANSFER_COMPLETED",
    });

    revalidatePath("/operations/transfers");
    revalidatePath("/products");
    revalidatePath("/dashboard");
    revalidatePath("/operations/move-history");

    return { success: true };
  } catch (error: any) {
    console.error("Validate transfer failed:", error);
    return { success: false, error: error.message || "Failed to validate transfer." };
  }
}
