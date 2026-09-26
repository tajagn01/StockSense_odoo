"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createProductAction(formData: FormData) {
  try {
    const user = await requireRole([UserRole.ADMIN, UserRole.INVENTORY_MANAGER]);

    const name = formData.get("name") as string;
    const sku = formData.get("sku") as string;
    const categoryId = formData.get("categoryId") as string;
    const uom = formData.get("uom") as string;
    const description = (formData.get("description") as string) || null;
    const barcode = (formData.get("barcode") as string) || null;
    const reorderLevel = parseInt((formData.get("reorderLevel") as string) || "20", 10);
    const reorderQuantity = parseInt((formData.get("reorderQuantity") as string) || "50", 10);
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

    // Create product
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        categoryId,
        uom: uom.trim(),
        description,
        barcode: barcode?.trim() || null,
        reorderRules: {
          create: {
            reorderLevel,
            reorderQuantity,
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
        if (initialQuantity > 0) {
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
              userId: user.id,
            },
          });
        }
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PRODUCT_CREATED",
        entity: "Product",
        entityId: product.id,
        metadata: { sku: product.sku, name: product.name },
      },
    });

    revalidatePath("/products");
    revalidatePath("/dashboard");
    revalidatePath("/operations/move-history");

    return { success: true, productId: product.id };
  } catch (error: any) {
    console.error("Create product failed:", error);
    return { success: false, error: error.message || "Failed to create product." };
  }
}

export async function updateProductAction(productId: string, formData: FormData) {
  try {
    const user = await requireRole([UserRole.ADMIN, UserRole.INVENTORY_MANAGER]);

    const name = formData.get("name") as string;
    const categoryId = formData.get("categoryId") as string;
    const uom = formData.get("uom") as string;
    const description = (formData.get("description") as string) || null;
    const barcode = (formData.get("barcode") as string) || null;
    const reorderLevel = parseInt((formData.get("reorderLevel") as string) || "20", 10);
    const reorderQuantity = parseInt((formData.get("reorderQuantity") as string) || "50", 10);

    if (!name || !categoryId || !uom) {
      return { success: false, error: "Name, category, and UOM are required." };
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        name: name.trim(),
        categoryId,
        uom: uom.trim(),
        description,
        barcode: barcode?.trim() || null,
      },
    });

    // Update or create reorder rule
    const existingRule = await prisma.reorderRule.findFirst({
      where: { productId },
    });

    if (existingRule) {
      await prisma.reorderRule.update({
        where: { id: existingRule.id },
        data: { reorderLevel, reorderQuantity },
      });
    } else {
      await prisma.reorderRule.create({
        data: { productId, reorderLevel, reorderQuantity },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PRODUCT_UPDATED",
        entity: "Product",
        entityId: productId,
        metadata: { name },
      },
    });

    revalidatePath("/products");
    revalidatePath(`/products/${productId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Update product failed:", error);
    return { success: false, error: error.message || "Failed to update product." };
  }
}

// Category Management
export async function createCategoryAction(formData: FormData) {
  try {
    const user = await requireRole([UserRole.ADMIN, UserRole.INVENTORY_MANAGER]);
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;

    if (!name) return { success: false, error: "Category name is required." };

    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) return { success: false, error: "Category already exists." };

    await prisma.category.create({
      data: { name, description },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CATEGORY_CREATED",
        entity: "Category",
        entityId: name,
      },
    });

    revalidatePath("/products/categories");
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCategoryAction(categoryId: string) {
  try {
    const user = await requireRole([UserRole.ADMIN, UserRole.INVENTORY_MANAGER]);

    const productCount = await prisma.product.count({
      where: { categoryId },
    });

    if (productCount > 0) {
      return {
        success: false,
        error: `Cannot delete category: ${productCount} product(s) currently depend on it. Reassign products first.`,
      };
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CATEGORY_DELETED",
        entity: "Category",
        entityId: categoryId,
      },
    });

    revalidatePath("/products/categories");
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Reorder Rule Management
export async function updateReorderRuleAction(formData: FormData) {
  try {
    const user = await requireRole([UserRole.ADMIN, UserRole.INVENTORY_MANAGER]);
    const ruleId = formData.get("ruleId") as string;
    const reorderLevel = parseInt((formData.get("reorderLevel") as string) || "20", 10);
    const reorderQuantity = parseInt((formData.get("reorderQuantity") as string) || "50", 10);

    if (!ruleId || reorderLevel < 0 || reorderQuantity <= 0) {
      return { success: false, error: "Invalid reorder parameters." };
    }

    await prisma.reorderRule.update({
      where: { id: ruleId },
      data: { reorderLevel, reorderQuantity },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "REORDER_RULE_UPDATED",
        entity: "ReorderRule",
        entityId: ruleId,
        metadata: { reorderLevel, reorderQuantity },
      },
    });

    revalidatePath("/products/reordering");
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
