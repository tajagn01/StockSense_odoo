"use server";

import { prisma } from "@/lib/prisma";
import { AdjustmentReason } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { canAdjustStock, assertPermission } from "@/lib/permissions";
import { generateDocumentNumber } from "@/lib/documentNumber";
import { notifyManagersAndAdmin } from "@/lib/notifications";
import { revalidatePath } from "next/cache";

export async function createAdjustmentAction(formData: FormData) {
  try {
    const user = await requireAuth();
    assertPermission(user.role, canAdjustStock, "perform inventory adjustments");

    const productId = formData.get("productId") as string;
    const locationId = formData.get("locationId") as string;
    const physicalQuantityRaw = parseInt((formData.get("physicalQuantity") as string) || "0", 10);
    const reason = (formData.get("reason") as AdjustmentReason) || AdjustmentReason.COUNTING_ERROR;
    const notes = (formData.get("notes") as string)?.trim() || null;

    if (!productId || !locationId) {
      return { success: false, error: "Please specify product and warehouse location." };
    }

    if (isNaN(physicalQuantityRaw) || physicalQuantityRaw < 0) {
      return { success: false, error: "Physical counted quantity must be a non-negative integer (>= 0)." };
    }

    // Verify existence and validity of resources
    const [product, location] = await Promise.all([
      prisma.product.findUnique({ where: { id: productId } }),
      prisma.location.findUnique({ where: { id: locationId }, include: { warehouse: true } }),
    ]);

    if (!product || !product.isActive) {
      return { success: false, error: "Specified product is invalid or inactive." };
    }

    if (!location || !location.warehouse?.isActive) {
      return { success: false, error: "Specified warehouse location is invalid or inactive." };
    }

    const adjustmentNo = await generateDocumentNumber("ADJ");

    // Atomic reconciliation transaction: inventory count, adjustment record, immutable ledger, and audit
    await prisma.$transaction(async (tx) => {
      // Find current inventory snapshot within transaction
      const existingInv = await tx.inventory.findUnique({
        where: {
          productId_locationId: {
            productId,
            locationId,
          },
        },
      });

      const systemQuantity = existingInv ? existingInv.quantity : 0;
      const difference = physicalQuantityRaw - systemQuantity;

      // Update inventory table to match physical count
      await tx.inventory.upsert({
        where: {
          productId_locationId: {
            productId,
            locationId,
          },
        },
        update: { quantity: physicalQuantityRaw },
        create: {
          productId,
          locationId,
          warehouseId: location.warehouseId,
          quantity: physicalQuantityRaw,
        },
      });

      // Create StockAdjustment record
      await tx.stockAdjustment.create({
        data: {
          adjustmentNo,
          productId,
          warehouseId: location.warehouseId,
          locationId,
          systemQuantity,
          physicalQuantity: physicalQuantityRaw,
          difference,
          reason,
          notes,
          createdById: user.id,
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
          afterQuantity: physicalQuantityRaw,
          referenceType: "ADJUSTMENT",
          referenceId: adjustmentNo,
          reason: `Physical count reconciliation [${reason}]: ${notes || "Cycle count update"}`,
          userId: user.id,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "STOCK_ADJUSTMENT",
          entity: "StockAdjustment",
          entityId: adjustmentNo,
          metadata: { systemQuantity, physicalQuantity: physicalQuantityRaw, difference, reason },
        },
      });
    });

    await notifyManagersAndAdmin({
      title: "Stock Adjustment Reconciled",
      message: `Adjustment ${adjustmentNo} performed by ${user.name}.`,
      type: "STOCK_ADJUSTED",
    });

    revalidatePath("/operations/adjustments");
    revalidatePath("/products");
    revalidatePath("/dashboard");
    revalidatePath("/operations/move-history");

    return { success: true, adjustmentNo };
  } catch (error: any) {
    console.error("Adjustment failed:", error);
    return { success: false, error: error.message || "Failed to process stock adjustment." };
  }
}
