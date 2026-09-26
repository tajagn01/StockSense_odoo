"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProductAction(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const sku = formData.get("sku") as string;
    const categoryId = formData.get("categoryId") as string;
    const uom = formData.get("uom") as string;
    const description = (formData.get("description") as string) || null;
    const reorderLevel = parseInt((formData.get("reorderLevel") as string) || "20", 10);
    const initialLocationId = formData.get("locationId") as string;
    const initialQuantity = parseInt((formData.get("initialQuantity") as string) || "0", 10);

    if (!name || !sku || !categoryId || !uom) {
      return { success: false, error: "Please fill in all required fields (Name, SKU, Category, UOM)" };
    }

    // Verify SKU uniqueness
    const existing = await prisma.product.findUnique({
      where: { sku: sku.trim().toUpperCase() },
    });
    if (existing) {
      return { success: false, error: `SKU '${sku}' is already taken.` };
    }

    // Find default user (e.g. manager) for ledger
    const defaultUser = await prisma.user.findFirst();

    // Create product
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        categoryId,
        uom: uom.trim(),
        description,
        reorderRules: {
          create: {
            reorderLevel,
            reorderQuantity: reorderLevel * 2,
          },
        },
      },
    });

    // If initial location provided, set up inventory
    if (initialLocationId) {
      const location = await prisma.location.findUnique({
        where: { id: initialLocationId },
      });

      if (location) {
        await prisma.inventory.create({
          data: {
            productId: product.id,
            warehouseId: location.warehouseId,
            locationId: location.id,
            quantity: initialQuantity,
          },
        });

        // Record in ledger if quantity > 0
        if (initialQuantity > 0 && defaultUser) {
          await prisma.stockLedger.create({
            data: {
              productId: product.id,
              warehouseId: location.warehouseId,
              locationId: location.id,
              movementType: "RECEIPT",
              quantity: initialQuantity,
              beforeQuantity: 0,
              afterQuantity: initialQuantity,
              referenceType: "INITIAL_STOCK",
              referenceId: `INIT-${product.sku}`,
              reason: "Opening stock on product creation",
              userId: defaultUser.id,
            },
          });
        }
      }
    }

    revalidatePath("/products");
    revalidatePath("/dashboard");
    revalidatePath("/operations/move-history");

    return { success: true };
  } catch (error: any) {
    console.error("Create product failed:", error);
    return { success: false, error: error.message || "Failed to create product." };
  }
}
