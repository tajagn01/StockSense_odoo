"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import {
  canCreateDelivery,
  canPickDelivery,
  canPackDelivery,
  canValidateDelivery,
  assertPermission,
} from "@/lib/permissions";
import { generateDocumentNumber } from "@/lib/documentNumber";
import { notifyManagersAndAdmin } from "@/lib/notifications";
import { revalidatePath } from "next/cache";

export async function createDeliveryAction(formData: FormData) {
  try {
    const user = await requireAuth();
    assertPermission(user.role, canCreateDelivery, "create delivery orders");

    const customerId = formData.get("customerId") as string;
    const warehouseId = formData.get("warehouseId") as string;
    const locationId = formData.get("locationId") as string;
    const productId = formData.get("productId") as string;
    const quantityRaw = parseInt((formData.get("quantity") as string) || "0", 10);
    const notes = (formData.get("notes") as string)?.trim() || null;

    if (!customerId || !warehouseId || !locationId || !productId) {
      return { success: false, error: "Customer, warehouse, location, and product are required." };
    }

    if (isNaN(quantityRaw) || quantityRaw <= 0) {
      return { success: false, error: "Delivery quantity must be a positive integer greater than zero." };
    }

    // Validate relationships and existence
    const [customer, warehouse, location, product] = await Promise.all([
      prisma.customer.findUnique({ where: { id: customerId } }),
      prisma.warehouse.findUnique({ where: { id: warehouseId } }),
      prisma.location.findUnique({ where: { id: locationId } }),
      prisma.product.findUnique({ where: { id: productId } }),
    ]);

    if (!customer) return { success: false, error: "Selected customer does not exist." };
    if (!warehouse || !warehouse.isActive) return { success: false, error: "Selected warehouse is invalid or inactive." };
    if (!location) return { success: false, error: "Selected warehouse location does not exist." };
    if (location.warehouseId !== warehouseId) {
      return { success: false, error: "The selected location does not belong to the selected warehouse." };
    }
    if (!product || !product.isActive) return { success: false, error: "Selected product is invalid or inactive." };

    const deliveryNo = await generateDocumentNumber("DEL");

    await prisma.delivery.create({
      data: {
        deliveryNo,
        customerId,
        warehouseId,
        status: "READY",
        notes,
        createdById: user.id,
        items: {
          create: [
            {
              productId,
              locationId,
              quantity: quantityRaw,
              pickedQuantity: 0,
              packedQuantity: 0,
            },
          ],
        },
      },
    });

    revalidatePath("/operations/deliveries");
    revalidatePath("/dashboard");
    return { success: true, deliveryNo };
  } catch (error: any) {
    console.error("Create delivery failed:", error);
    return { success: false, error: error.message || "Failed to create delivery order." };
  }
}

/**
 * Step 1: Advance delivery to PICKING status
 */
export async function startPickingDeliveryAction(deliveryId: string) {
  try {
    const user = await requireAuth();
    assertPermission(user.role, canPickDelivery, "start picking delivery orders");

    if (!deliveryId) return { success: false, error: "Delivery ID is required." };

    const result = await prisma.$transaction(async (tx) => {
      const delivery = await tx.delivery.findUnique({
        where: { id: deliveryId },
      });

      if (!delivery) throw new Error("Delivery order not found.");

      const updated = await tx.delivery.updateMany({
        where: {
          id: deliveryId,
          status: { in: ["READY", "DRAFT"] },
        },
        data: { status: "PICKING" },
      });

      if (updated.count === 0) {
        throw new Error(`Cannot start picking: delivery is currently in ${delivery.status} status.`);
      }

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "START_PICKING_DELIVERY",
          entity: "Delivery",
          entityId: delivery.id,
          metadata: { deliveryNo: delivery.deliveryNo },
        },
      });

      return delivery;
    });

    revalidatePath("/operations/deliveries");
    return { success: true };
  } catch (error: any) {
    console.error("Start picking failed:", error);
    return { success: false, error: error.message || "Failed to start picking." };
  }
}

/**
 * Step 2: Mark items as picked
 */
export async function markDeliveryPickedAction(deliveryId: string) {
  try {
    const user = await requireAuth();
    assertPermission(user.role, canPickDelivery, "mark delivery items picked");

    if (!deliveryId) return { success: false, error: "Delivery ID is required." };

    await prisma.$transaction(async (tx) => {
      const delivery = await tx.delivery.findUnique({
        where: { id: deliveryId },
        include: { items: true },
      });

      if (!delivery) throw new Error("Delivery order not found.");
      if (delivery.status !== "PICKING") {
        throw new Error(`Delivery must be in PICKING status. Current status: ${delivery.status}.`);
      }

      for (const item of delivery.items) {
        await tx.deliveryItem.update({
          where: { id: item.id },
          data: { pickedQuantity: item.quantity },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "MARK_DELIVERY_PICKED",
          entity: "Delivery",
          entityId: delivery.id,
          metadata: { deliveryNo: delivery.deliveryNo },
        },
      });
    });

    revalidatePath("/operations/deliveries");
    return { success: true };
  } catch (error: any) {
    console.error("Mark delivery picked failed:", error);
    return { success: false, error: error.message || "Failed to mark items picked." };
  }
}

/**
 * Step 3: Pack items and advance to PACKED status
 */
export async function packDeliveryAction(deliveryId: string) {
  try {
    const user = await requireAuth();
    assertPermission(user.role, canPackDelivery, "pack delivery orders");

    if (!deliveryId) return { success: false, error: "Delivery ID is required." };

    await prisma.$transaction(async (tx) => {
      const delivery = await tx.delivery.findUnique({
        where: { id: deliveryId },
        include: { items: true },
      });

      if (!delivery) throw new Error("Delivery order not found.");
      if (delivery.status !== "PICKING") {
        throw new Error("Delivery must be in PICKING status before packing.");
      }

      for (const item of delivery.items) {
        if (item.pickedQuantity < item.quantity) {
          throw new Error(
            `All items must be picked before packing. Item requires ${item.quantity}, picked: ${item.pickedQuantity}.`
          );
        }
      }

      for (const item of delivery.items) {
        await tx.deliveryItem.update({
          where: { id: item.id },
          data: { packedQuantity: item.quantity },
        });
      }

      const updated = await tx.delivery.updateMany({
        where: { id: deliveryId, status: "PICKING" },
        data: { status: "PACKED" },
      });

      if (updated.count === 0) {
        throw new Error("Delivery order status was modified concurrently. Please refresh.");
      }

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "PACK_DELIVERY",
          entity: "Delivery",
          entityId: delivery.id,
          metadata: { deliveryNo: delivery.deliveryNo },
        },
      });
    });

    revalidatePath("/operations/deliveries");
    return { success: true };
  } catch (error: any) {
    console.error("Pack delivery failed:", error);
    return { success: false, error: error.message || "Failed to pack delivery." };
  }
}

/**
 * Step 4: Validate & Ship delivery (PACKED -> DONE)
 * Guaranteed concurrency-safe conditional inventory decrement preventing negative stock.
 */
export async function validateDeliveryAction(deliveryId: string) {
  try {
    const user = await requireAuth();
    assertPermission(user.role, canValidateDelivery, "validate and dispatch delivery shipments");

    if (!deliveryId) return { success: false, error: "Delivery ID is required." };

    // Execute atomic transaction: validation, stock check, decrement, ledger log
    const result = await prisma.$transaction(async (tx) => {
      const delivery = await tx.delivery.findUnique({
        where: { id: deliveryId },
        include: {
          items: {
            include: {
              product: {
                include: { reorderRules: true },
              },
            },
          },
        },
      });

      if (!delivery) throw new Error("Delivery order not found.");

      // 1. Prevent double validation / enforce strict state transition
      const updatedDelivery = await tx.delivery.updateMany({
        where: { id: deliveryId, status: "PACKED" },
        data: { status: "DONE" },
      });

      if (updatedDelivery.count === 0) {
        throw new Error("Delivery order is not in PACKED status or has already been completed.");
      }

      // 2. Decrement inventory atomically and verify no negative balances
      for (const item of delivery.items) {
        if (item.packedQuantity < item.quantity) {
          throw new Error(
            `Incomplete packing: ${item.product.name} has only ${item.packedQuantity}/${item.quantity} packed.`
          );
        }

        // Database-level atomic conditional decrement: guarantees stock never drops below zero
        const updateResult = await tx.inventory.updateMany({
          where: {
            productId: item.productId,
            locationId: item.locationId,
            quantity: { gte: item.quantity },
          },
          data: {
            quantity: { decrement: item.quantity },
          },
        });

        if (updateResult.count === 0) {
          const currentInv = await tx.inventory.findUnique({
            where: {
              productId_locationId: {
                productId: item.productId,
                locationId: item.locationId,
              },
            },
          });
          const available = currentInv ? currentInv.quantity : 0;
          throw new Error(
            `Insufficient stock for '${item.product.name}'. Required: ${item.quantity} ${item.product.uom}, Available: ${available} ${item.product.uom}. Operation aborted.`
          );
        }

        // Fetch post-update quantity to maintain ledger precision
        const updatedInv = await tx.inventory.findUnique({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: item.locationId,
            },
          },
        });

        const afterQty = updatedInv ? updatedInv.quantity : 0;
        const beforeQty = afterQty + item.quantity;

        // Immutable StockLedger entry
        await tx.stockLedger.create({
          data: {
            productId: item.productId,
            warehouseId: delivery.warehouseId,
            locationId: item.locationId,
            movementType: "DELIVERY",
            quantity: -item.quantity,
            beforeQuantity: beforeQty,
            afterQuantity: afterQty,
            referenceType: "DELIVERY",
            referenceId: delivery.deliveryNo,
            reason: `Outward delivery validation to customer (${delivery.deliveryNo})`,
            userId: user.id,
          },
        });

        // Deduplicated threshold alerting for low stock / out of stock
        const reorderLevel = item.product.reorderRules[0]?.reorderLevel ?? 20;
        if (beforeQty > 0 && afterQty === 0) {
          // Triggered only when stock drops to 0
          await tx.notification.create({
            data: {
              userId: user.id,
              title: "Out of Stock Alert",
              message: `Product '${item.product.name}' (${item.product.sku}) is now OUT OF STOCK following delivery ${delivery.deliveryNo}.`,
              type: "OUT_OF_STOCK",
            },
          });
        } else if (beforeQty > reorderLevel && afterQty <= reorderLevel) {
          // Triggered only when crossing into low stock
          await tx.notification.create({
            data: {
              userId: user.id,
              title: "Low Stock Alert",
              message: `Product '${item.product.name}' (${item.product.sku}) is below reorder level (${afterQty}/${reorderLevel}).`,
              type: "LOW_STOCK",
            },
          });
        }
      }

      // 3. Audit log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "VALIDATE_DELIVERY",
          entity: "Delivery",
          entityId: delivery.id,
          metadata: { deliveryNo: delivery.deliveryNo, itemsCount: delivery.items.length },
        },
      });

      return delivery;
    });

    await notifyManagersAndAdmin({
      title: "Delivery Order Dispatched",
      message: `Delivery ${result.deliveryNo} successfully validated and shipped by ${user.name}.`,
      type: "DELIVERY_COMPLETED",
    });

    revalidatePath("/operations/deliveries");
    revalidatePath("/products");
    revalidatePath("/dashboard");
    revalidatePath("/operations/move-history");

    return { success: true };
  } catch (error: any) {
    console.error("Validate delivery failed:", error);
    return { success: false, error: error.message || "Failed to validate delivery." };
  }
}
