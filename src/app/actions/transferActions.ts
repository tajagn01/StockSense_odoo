"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTransferAction(formData: FormData) {
  try {
    const sourceLocationId = formData.get("sourceLocationId") as string;
    const destinationLocationId = formData.get("destinationLocationId") as string;
    const productId = formData.get("productId") as string;
    const quantity = parseInt((formData.get("quantity") as string) || "1", 10);
    const notes = (formData.get("notes") as string) || null;

    if (!sourceLocationId || !destinationLocationId || !productId || quantity <= 0) {
      return { success: false, error: "Please provide valid transfer locations, product, and quantity > 0." };
    }

    if (sourceLocationId === destinationLocationId) {
      return { success: false, error: "Source location and destination location cannot be identical." };
    }

    const defaultUser = await prisma.user.findFirst();
    if (!defaultUser) throw new Error("No default user found.");

    // Fetch warehouse IDs for locations
    const [srcLoc, destLoc] = await Promise.all([
      prisma.location.findUnique({ where: { id: sourceLocationId } }),
      prisma.location.findUnique({ where: { id: destinationLocationId } }),
    ]);

    if (!srcLoc || !destLoc) throw new Error("Invalid location selected.");

    const count = await prisma.transfer.count();
    const transferNo = `TRF-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    await prisma.transfer.create({
      data: {
        transferNo,
        sourceWarehouseId: srcLoc.warehouseId,
        sourceLocationId: srcLoc.id,
        destinationWarehouseId: destLoc.warehouseId,
        destinationLocationId: destLoc.id,
        status: "READY",
        notes,
        createdById: defaultUser.id,
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

    revalidatePath("/operations/transfers");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Create transfer failed:", error);
    return { success: false, error: error.message || "Failed to schedule transfer." };
  }
}

export async function validateTransferAction(transferId: string) {
  try {
    const defaultUser = await prisma.user.findFirst();
    if (!defaultUser) throw new Error("No default user found.");

    await prisma.$transaction(async (tx) => {
      const transfer = await tx.transfer.findUnique({
        where: { id: transferId },
        include: { items: { include: { product: true } } },
      });

      if (!transfer) throw new Error("Transfer not found.");
      if (transfer.status === "DONE") throw new Error("Transfer has already been completed.");

      for (const item of transfer.items) {
        // 1. Check source inventory
        const srcInv = await tx.inventory.findUnique({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: transfer.sourceLocationId,
            },
          },
        });

        const srcAvailable = srcInv ? srcInv.quantity : 0;
        if (srcAvailable < item.quantity) {
          throw new Error(
            `Insufficient stock at source location for '${item.product.name}'. Required: ${item.quantity}, Available: ${srcAvailable}.`
          );
        }

        const srcAfter = srcAvailable - item.quantity;

        // Decrement source inventory
        await tx.inventory.update({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: transfer.sourceLocationId,
            },
          },
          data: { quantity: srcAfter },
        });

        // 2. Increment destination inventory
        const destInv = await tx.inventory.findUnique({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: transfer.destinationLocationId,
            },
          },
        });

        const destBefore = destInv ? destInv.quantity : 0;
        const destAfter = destBefore + item.quantity;

        await tx.inventory.upsert({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: transfer.destinationLocationId,
            },
          },
          update: { quantity: destAfter },
          create: {
            productId: item.productId,
            locationId: transfer.destinationLocationId,
            warehouseId: transfer.destinationWarehouseId,
            quantity: destAfter,
          },
        });

        // 3. Immutable StockLedger entries (Dual-entry transfer)
        // Source Out
        await tx.stockLedger.create({
          data: {
            productId: item.productId,
            warehouseId: transfer.sourceWarehouseId,
            locationId: transfer.sourceLocationId,
            movementType: "TRANSFER_OUT",
            quantity: -item.quantity,
            beforeQuantity: srcAvailable,
            afterQuantity: srcAfter,
            referenceType: "TRANSFER",
            referenceId: transfer.transferNo,
            reason: `Internal transfer out to ${transfer.destinationLocationId} (${transfer.transferNo})`,
            userId: defaultUser.id,
          },
        });

        // Destination In
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
            reason: `Internal transfer in from ${transfer.sourceLocationId} (${transfer.transferNo})`,
            userId: defaultUser.id,
          },
        });
      }

      // Mark transfer DONE
      await tx.transfer.update({
        where: { id: transferId },
        data: { status: "DONE" },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: defaultUser.id,
          action: "VALIDATE_TRANSFER",
          entity: "Transfer",
          entityId: transfer.id,
          metadata: { transferNo: transfer.transferNo },
        },
      });
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
