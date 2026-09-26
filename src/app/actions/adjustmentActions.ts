"use server";

import { prisma } from "@/lib/prisma";
import { AdjustmentReason } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createAdjustmentAction(formData: FormData) {
  try {
    const productId = formData.get("productId") as string;
    const locationId = formData.get("locationId") as string;
    const physicalQuantity = parseInt((formData.get("physicalQuantity") as string) || "0", 10);
    const reason = (formData.get("reason") as AdjustmentReason) || AdjustmentReason.COUNTING_ERROR;
    const notes = (formData.get("notes") as string) || null;

    if (!productId || !locationId || physicalQuantity < 0) {
      return { success: false, error: "Please enter valid adjustment details (physical quantity cannot be negative)." };
    }

    const defaultUser = await prisma.user.findFirst();
    if (!defaultUser) throw new Error("No default user found.");

    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });
    if (!location) throw new Error("Invalid location.");

    // Atomic reconciliation transaction
    await prisma.$transaction(async (tx) => {
      // Find current inventory
      const existingInv = await tx.inventory.findUnique({
        where: {
          productId_locationId: {
            productId,
            locationId,
          },
        },
      });

      const systemQuantity = existingInv ? existingInv.quantity : 0;
      const difference = physicalQuantity - systemQuantity;

      // Update inventory table to match physical count
      await tx.inventory.upsert({
        where: {
          productId_locationId: {
            productId,
            locationId,
          },
        },
        update: { quantity: physicalQuantity },
        create: {
          productId,
          locationId,
          warehouseId: location.warehouseId,
          quantity: physicalQuantity,
        },
      });

      // Generate adjustment number
      const count = await tx.stockAdjustment.count();
      const adjustmentNo = `ADJ-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

      // Create StockAdjustment record
      await tx.stockAdjustment.create({
        data: {
          adjustmentNo,
          productId,
          warehouseId: location.warehouseId,
          locationId,
          systemQuantity,
          physicalQuantity,
          difference,
          reason,
          notes,
          createdById: defaultUser.id,
        },
      });

      // Create StockLedger entry
      await tx.stockLedger.create({
        data: {
          productId,
          warehouseId: location.warehouseId,
          locationId,
          movementType: "ADJUSTMENT",
          quantity: difference,
          beforeQuantity: systemQuantity,
          afterQuantity: physicalQuantity,
          referenceType: "ADJUSTMENT",
          referenceId: adjustmentNo,
          reason: `Physical count reconciliation [${reason}]: ${notes || "No notes"}`,
          userId: defaultUser.id,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: defaultUser.id,
          action: "STOCK_ADJUSTMENT",
          entity: "StockAdjustment",
          entityId: adjustmentNo,
          metadata: { systemQuantity, physicalQuantity, difference, reason },
        },
      });
    });

    revalidatePath("/operations/adjustments");
    revalidatePath("/products");
    revalidatePath("/dashboard");
    revalidatePath("/operations/move-history");

    return { success: true };
  } catch (error: any) {
    console.error("Adjustment failed:", error);
    return { success: false, error: error.message || "Failed to process stock adjustment." };
  }
}
