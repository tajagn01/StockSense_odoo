"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateDocumentNumber } from "@/lib/documentNumber";
import { notifyManagersAndAdmin } from "@/lib/notifications";
import { revalidatePath } from "next/cache";

export async function createDeliveryAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Authentication required to create delivery order." };
    }

    const customerId = formData.get("customerId") as string;
    const warehouseId = formData.get("warehouseId") as string;
    const locationId = formData.get("locationId") as string;
    const productId = formData.get("productId") as string;
    const quantity = parseInt((formData.get("quantity") as string) || "1", 10);
    const notes = (formData.get("notes") as string) || null;

    if (!customerId || !warehouseId || !locationId || !productId || quantity <= 0) {
      return { success: false, error: "Please provide valid delivery parameters and quantity > 0." };
    }

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
              quantity,
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
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { items: true },
    });

    if (!delivery) return { success: false, error: "Delivery not found." };
    if (delivery.status !== "READY" && delivery.status !== "DRAFT") {
      return { success: false, error: `Cannot start picking from status ${delivery.status}.` };
    }

    await prisma.$transaction(async (tx) => {
      await tx.delivery.update({
        where: { id: deliveryId },
        data: { status: "PICKING" },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "START_PICKING_DELIVERY",
          entity: "Delivery",
          entityId: delivery.id,
          metadata: { deliveryNo: delivery.deliveryNo },
        },
      });
    });

    revalidatePath("/operations/deliveries");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Step 2: Mark items as picked
 */
export async function markDeliveryPickedAction(deliveryId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { items: true },
    });

    if (!delivery) return { success: false, error: "Delivery not found." };

    await prisma.$transaction(async (tx) => {
      // Set pickedQuantity = quantity for all items
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
    return { success: false, error: error.message };
  }
}

/**
 * Step 3: Pack items and advance to PACKED status
 */
export async function packDeliveryAction(deliveryId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { items: true },
    });

    if (!delivery) return { success: false, error: "Delivery not found." };
    if (delivery.status !== "PICKING") {
      return { success: false, error: "Delivery must be in PICKING status before packing." };
    }

    // Verify all items are picked
    for (const item of delivery.items) {
      if (item.pickedQuantity < item.quantity) {
        return {
          success: false,
          error: `All items must be picked before packing. Item requires ${item.quantity}, picked: ${item.pickedQuantity}.`,
        };
      }
    }

    await prisma.$transaction(async (tx) => {
      // Set packedQuantity = quantity
      for (const item of delivery.items) {
        await tx.deliveryItem.update({
          where: { id: item.id },
          data: { packedQuantity: item.quantity },
        });
      }

      await tx.delivery.update({
        where: { id: deliveryId },
        data: { status: "PACKED" },
      });

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
    return { success: false, error: error.message };
  }
}

/**
 * Step 4: Validate & Ship delivery (PACKED -> DONE)
 */
export async function validateDeliveryAction(deliveryId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Authentication required to validate delivery." };
    }

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
      if (delivery.status === "DONE") throw new Error("Delivery order is already validated.");
      if (delivery.status !== "PACKED") {
        throw new Error(`Delivery must be packed before shipping. Current stage: ${delivery.status}.`);
      }

      // Check stock availability and verify packed quantity for all items
      for (const item of delivery.items) {
        if (item.packedQuantity < item.quantity) {
          throw new Error(`Incomplete packing: ${item.product.name} has only ${item.packedQuantity}/${item.quantity} packed.`);
        }

        const inventory = await tx.inventory.findUnique({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: item.locationId,
            },
          },
        });

        const currentStock = inventory ? inventory.quantity : 0;
        if (currentStock < item.quantity) {
          throw new Error(
            `Insufficient stock for '${item.product.name}'. Required: ${item.quantity} ${item.product.uom}, Available: ${currentStock} ${item.product.uom}.`
          );
        }

        const afterQty = currentStock - item.quantity;
        if (afterQty < 0) {
          throw new Error(`Validation prevented: stock cannot drop below zero.`);
        }

        // Decrement inventory
        await tx.inventory.update({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: item.locationId,
            },
          },
          data: { quantity: afterQty },
        });

        // Add to immutable StockLedger
        await tx.stockLedger.create({
          data: {
            productId: item.productId,
            warehouseId: delivery.warehouseId,
            locationId: item.locationId,
            movementType: "DELIVERY",
            quantity: -item.quantity,
            beforeQuantity: currentStock,
            afterQuantity: afterQty,
            referenceType: "DELIVERY",
            referenceId: delivery.deliveryNo,
            reason: `Outward delivery validation to customer (${delivery.deliveryNo})`,
            userId: user.id,
          },
        });

        // Check if low stock or out of stock triggered
        const reorderLevel = item.product.reorderRules[0]?.reorderLevel ?? 20;
        if (afterQty === 0) {
          await tx.notification.create({
            data: {
              userId: user.id,
              title: "Out of Stock Alert",
              message: `Product '${item.product.name}' (${item.product.sku}) is now OUT OF STOCK following delivery ${delivery.deliveryNo}.`,
              type: "OUT_OF_STOCK",
            },
          });
        } else if (afterQty <= reorderLevel) {
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

      // Mark delivery DONE
      await tx.delivery.update({
        where: { id: deliveryId },
        data: { status: "DONE" },
      });

      // Audit log
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
