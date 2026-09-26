"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import {
  canManageProducts,
  canManageCategories,
  canManageReorderRules,
  assertPermission,
} from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export async function createProductAction(formData: FormData) {
  try {
    const user = await requireAuth();
    assertPermission(user.role, canManageProducts, "create new products");

    const name = formData.get("name") as string;
    const sku = formData.get("sku") as string;
    const categoryId = formData.get("categoryId") as string;
    const uom = formData.get("uom") as string;
    const description = (formData.get("description") as string)?.trim() || null;
    const barcode = (formData.get("barcode") as string)?.trim() || null;
    const reorderLevelRaw = parseInt((formData.get("reorderLevel") as string) || "20", 10);
    const reorderQuantityRaw = parseInt((formData.get("reorderQuantity") as string) || "50", 10);
    const initialLocationId = formData.get("locationId") as string;
    const initialQuantityRaw = parseInt((formData.get("initialQuantity") as string) || "0", 10);

    if (!name || !sku || !categoryId || !uom) {
      return { success: false, error: "Please fill in all required fields (Name, SKU, Category, UOM)." };
    }

    const reorderLevel = isNaN(reorderLevelRaw) || reorderLevelRaw < 0 ? 20 : reorderLevelRaw;
    const reorderQuantity = isNaN(reorderQuantityRaw) || reorderQuantityRaw <= 0 ? 50 : reorderQuantityRaw;
    const initialQuantity = isNaN(initialQuantityRaw) || initialQuantityRaw < 0 ? 0 : initialQuantityRaw;

    const normalizedSku = sku.trim().toUpperCase();

    // Verify SKU uniqueness
    const existing = await prisma.product.findUnique({
      where: { sku: normalizedSku },
    });
    if (existing) {
      return { success: false, error: `SKU '${sku}' is already taken.` };
    }

    // Atomic transaction for Product, ReorderRule, Opening Inventory, and Opening Ledger
    const product = await prisma.$transaction(async (tx) => {
      const createdProduct = await tx.product.create({
        data: {
          name: name.trim(),
          sku: normalizedSku,
          categoryId,
          uom: uom.trim(),
          description,
          barcode: barcode || null,
          reorderRules: {
            create: {
              reorderLevel,
              reorderQuantity,
            },
          },
        },
      });

      if (initialLocationId) {
        const location = await tx.location.findUnique({
          where: { id: initialLocationId },
        });

        if (location) {
          await tx.inventory.create({
            data: {
              productId: createdProduct.id,
              warehouseId: location.warehouseId,
              locationId: location.id,
              quantity: initialQuantity,
            },
          });

          if (initialQuantity > 0) {
            await tx.stockLedger.create({
              data: {
                productId: createdProduct.id,
                warehouseId: location.warehouseId,
                locationId: location.id,
                movementType: "RECEIPT",
                quantity: initialQuantity,
                beforeQuantity: 0,
                afterQuantity: initialQuantity,
                referenceType: "INITIAL_STOCK",
                referenceId: `INIT-${createdProduct.sku}`,
                reason: "Opening stock on product creation",
                userId: user.id,
              },
            });
          }
        }
      }

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "PRODUCT_CREATED",
          entity: "Product",
          entityId: createdProduct.id,
          metadata: { sku: createdProduct.sku, name: createdProduct.name },
        },
      });

      return createdProduct;
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
    const user = await requireAuth();
    assertPermission(user.role, canManageProducts, "update products");

    const name = formData.get("name") as string;
    const categoryId = formData.get("categoryId") as string;
    const uom = formData.get("uom") as string;
    const description = (formData.get("description") as string)?.trim() || null;
    const barcode = (formData.get("barcode") as string)?.trim() || null;
    const reorderLevel = parseInt((formData.get("reorderLevel") as string) || "20", 10);
    const reorderQuantity = parseInt((formData.get("reorderQuantity") as string) || "50", 10);

    if (!name || !categoryId || !uom) {
      return { success: false, error: "Name, category, and UOM are required." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: {
          name: name.trim(),
          categoryId,
          uom: uom.trim(),
          description,
          barcode: barcode || null,
        },
      });

      // Update or create reorder rule
      const existingRule = await tx.reorderRule.findFirst({
        where: { productId },
      });

      if (existingRule) {
        await tx.reorderRule.update({
          where: { id: existingRule.id },
          data: { reorderLevel, reorderQuantity },
        });
      } else {
        await tx.reorderRule.create({
          data: { productId, reorderLevel, reorderQuantity },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "PRODUCT_UPDATED",
          entity: "Product",
          entityId: productId,
          metadata: { name },
        },
      });
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
    const user = await requireAuth();
    assertPermission(user.role, canManageCategories, "create product categories");

    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;

    if (!name) return { success: false, error: "Category name is required." };

    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) return { success: false, error: "Category already exists." };

    await prisma.$transaction(async (tx) => {
      await tx.category.create({
        data: { name, description },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "CATEGORY_CREATED",
          entity: "Category",
          entityId: name,
        },
      });
    });

    revalidatePath("/products/categories");
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    console.error("Create category failed:", error);
    return { success: false, error: error.message || "Failed to create category." };
  }
}

export async function deleteCategoryAction(categoryId: string) {
  try {
    const user = await requireAuth();
    assertPermission(user.role, canManageCategories, "delete product categories");

    const productCount = await prisma.product.count({
      where: { categoryId },
    });

    if (productCount > 0) {
      return {
        success: false,
        error: `Cannot delete category: ${productCount} product(s) currently depend on it. Reassign products first.`,
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.category.delete({
        where: { id: categoryId },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "CATEGORY_DELETED",
          entity: "Category",
          entityId: categoryId,
        },
      });
    });

    revalidatePath("/products/categories");
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    console.error("Delete category failed:", error);
    return { success: false, error: error.message || "Failed to delete category." };
  }
}

// Reorder Rule Management
export async function updateReorderRuleAction(formData: FormData) {
  try {
    const user = await requireAuth();
    assertPermission(user.role, canManageReorderRules, "update reorder rules");

    const ruleId = formData.get("ruleId") as string;
    const reorderLevel = parseInt((formData.get("reorderLevel") as string) || "20", 10);
    const reorderQuantity = parseInt((formData.get("reorderQuantity") as string) || "50", 10);

    if (!ruleId || reorderLevel < 0 || reorderQuantity <= 0) {
      return { success: false, error: "Invalid reorder parameters. Thresholds must be positive numbers." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.reorderRule.update({
        where: { id: ruleId },
        data: { reorderLevel, reorderQuantity },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "REORDER_RULE_UPDATED",
          entity: "ReorderRule",
          entityId: ruleId,
          metadata: { reorderLevel, reorderQuantity },
        },
      });
    });

    revalidatePath("/products/reordering");
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    console.error("Update reorder rule failed:", error);
    return { success: false, error: error.message || "Failed to update reorder rule." };
  }
}
