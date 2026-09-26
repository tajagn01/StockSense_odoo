"use server";

import { prisma } from "@/lib/prisma";
import { AdjustmentReason } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { canAdjustStock, assertPermission } from "@/lib/permissions";
import { generateDocumentNumber } from "@/lib/documentNumber";
import { reconcileInventoryWithLock } from "@/lib/inventory";
import { notifyManagersAndAdmin } from "@/lib/notifications";
import { safeRevalidatePath } from "@/lib/serverUtils";

export async function createAdjustmentAction(formData: FormData) {
  try {
    const user = await requireAuth();
    assertPermission(user.role, canAdjustStock, "perform inventory adjustments");

    const productId = (formData.get("productId") as string)?.trim();
    const locationId = (formData.get("locationId") as string)?.trim();
    const physicalQuantityStr = (formData.get("physicalQuantity") as string)?.trim();
    const reason = (formData.get("reason") as AdjustmentReason) || AdjustmentReason.COUNTING_ERROR;
    const notes = (formData.get("notes") as string)?.trim() || null;

    if (!productId || !locationId) {
      return { success: false, error: "Please specify product and warehouse location." };
    }

    // Strict non-negative integer validation
    if (!physicalQuantityStr || !/^\d+$/.test(physicalQuantityStr)) {
      return { success: false, error: "Physical counted quantity must be a non-negative whole integer (>= 0)." };
    }
    const physicalQuantity = parseInt(physicalQuantityStr, 10);
    if (physicalQuantity < 0 || !Number.isSafeInteger(physicalQuantity)) {
      return { success: false, error: "Physical counted quantity must be greater than or equal to zero." };
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

    // Atomic reconciliation transaction protected by PostgreSQL row-level lock (FOR UPDATE)
    await prisma.$transaction(async (tx) => {
      // Reconciles inventory under exclusive row lock, preventing race conditions with concurrent movements
      const reconciliation = await reconcileInventoryWithLock(tx, {
        productId,
        warehouseId: location.warehouseId,
        locationId,
        physicalQuantity,
      });

      // Create StockAdjustment record
      await tx.stockAdjustment.create({
        data: {
          adjustmentNo,
          productId,
          warehouseId: location.warehouseId,
          locationId,
          systemQuantity: reconciliation.systemQuantity,
          physicalQuantity: reconciliation.physicalQuantity,
          difference: reconciliation.difference,
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
          quantity: reconciliation.difference,
          beforeQuantity: reconciliation.beforeQuantity,
          afterQuantity: reconciliation.afterQuantity,
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
          metadata: {
            systemQuantity: reconciliation.systemQuantity,
            physicalQuantity: reconciliation.physicalQuantity,
            difference: reconciliation.difference,
            reason,
          },
        },
      });
    }, { maxWait: 15000, timeout: 30000 });

    await notifyManagersAndAdmin({
      title: "Stock Adjustment Reconciled",
      message: `Adjustment ${adjustmentNo} performed by ${user.name}.`,
      type: "STOCK_ADJUSTED",
    });

    safeRevalidatePath("/operations/adjustments");
    safeRevalidatePath("/products");
    safeRevalidatePath("/dashboard");
    safeRevalidatePath("/operations/move-history");

    return { success: true, adjustmentNo };
  } catch (error: any) {
    console.error("Adjustment failed:", error);
    return { success: false, error: error.message || "Failed to process stock adjustment." };
  }
}
