"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createDeliveryAction(formData: FormData) {
  try {
    const customerId = formData.get("customerId") as string;
    const warehouseId = formData.get("warehouseId") as string;
    const locationId = formData.get("locationId") as string;
    const productId = formData.get("productId") as string;
    const quantity = parseInt((formData.get("quantity") as string) || "1", 10);
    const notes = (formData.get("notes") as string) || null;

    if (!customerId || !warehouseId || !locationId || !productId || quantity <= 0) {
      return { success: false, error: "Please provide valid delivery parameters and quantity > 0." };
    }

    const defaultUser = await prisma.user.findFirst();
    if (!defaultUser) throw new Error("No default user found.");

    // Generate delivery number
    const count = await prisma.delivery.count();
    const deliveryNo = `DEL-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    await prisma.delivery.create({
      data: {
        deliveryNo,
        customerId,
        warehouseId,
        status: "READY",
        notes,
        createdById: defaultUser.id,
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

    revalidatePath("/operations/deliveries");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Create delivery failed:", error);
    return { success: false, error: error.message || "Failed to create delivery order." };
  }
}

export async function validateDeliveryAction(deliveryId: string) {
  try {
    const defaultUser = await prisma.user.findFirst();
    if (!defaultUser) throw new Error("No default user found.");

    // Execute atomic transaction: validation, stock check, decrement, ledger log
    await prisma.$transaction(async (tx) => {
      const delivery = await tx.delivery.findUnique({
        where: { id: deliveryId },
        include: { items: { include: { product: true } } },
      });

      if (!delivery) throw new Error("Delivery order not found.");
      if (delivery.status === "DONE") throw new Error("Delivery order is already validated.");

      // Check stock availability for all items before decrementing
      for (const item of delivery.items) {
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
            userId: defaultUser.id,
          },
        });
      }

      // Mark delivery DONE
      await tx.delivery.update({
        where: { id: deliveryId },
        data: { status: "DONE" },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: defaultUser.id,
          action: "VALIDATE_DELIVERY",
          entity: "Delivery",
          entityId: delivery.id,
          metadata: { deliveryNo: delivery.deliveryNo, itemsCount: delivery.items.length },
        },
      });
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
