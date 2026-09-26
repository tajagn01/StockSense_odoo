"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { canManageWarehouses, assertPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export async function createWarehouseAction(formData: FormData) {
  try {
    const user = await requireAuth();
    assertPermission(user.role, canManageWarehouses, "create new warehouses");

    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const address = (formData.get("address") as string)?.trim() || null;

    if (!name || !code) {
      return { success: false, error: "Name and warehouse code are required." };
    }

    const normalizedCode = code.trim().toUpperCase();

    const existing = await prisma.warehouse.findUnique({
      where: { code: normalizedCode },
    });
    if (existing) {
      return { success: false, error: `Warehouse code '${code}' already exists.` };
    }

    await prisma.$transaction(async (tx) => {
      const wh = await tx.warehouse.create({
        data: {
          name: name.trim(),
          code: normalizedCode,
          address,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "WAREHOUSE_CREATED",
          entity: "Warehouse",
          entityId: wh.id,
          metadata: { code: wh.code, name: wh.name },
        },
      });
    });

    revalidatePath("/settings/warehouses");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Create warehouse failed:", error);
    return { success: false, error: error.message || "Failed to create warehouse." };
  }
}

export async function updateWarehouseAction(warehouseId: string, formData: FormData) {
  try {
    const user = await requireAuth();
    assertPermission(user.role, canManageWarehouses, "update warehouses");

    const name = (formData.get("name") as string)?.trim();
    const address = (formData.get("address") as string)?.trim() || null;

    if (!name) return { success: false, error: "Warehouse name is required." };

    await prisma.$transaction(async (tx) => {
      await tx.warehouse.update({
        where: { id: warehouseId },
        data: { name, address },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "WAREHOUSE_UPDATED",
          entity: "Warehouse",
          entityId: warehouseId,
        },
      });
    });

    revalidatePath("/settings/warehouses");
    return { success: true };
  } catch (error: any) {
    console.error("Update warehouse failed:", error);
    return { success: false, error: error.message || "Failed to update warehouse." };
  }
}

export async function toggleWarehouseStatusAction(warehouseId: string, isActive: boolean) {
  try {
    const user = await requireAuth();
    assertPermission(user.role, canManageWarehouses, "toggle warehouse status");

    await prisma.$transaction(async (tx) => {
      await tx.warehouse.update({
        where: { id: warehouseId },
        data: { isActive },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: isActive ? "WAREHOUSE_ACTIVATED" : "WAREHOUSE_ARCHIVED",
          entity: "Warehouse",
          entityId: warehouseId,
        },
      });
    });

    revalidatePath("/settings/warehouses");
    return { success: true };
  } catch (error: any) {
    console.error("Toggle warehouse status failed:", error);
    return { success: false, error: error.message || "Failed to change warehouse status." };
  }
}

export async function createLocationAction(formData: FormData) {
  try {
    const user = await requireAuth();
    assertPermission(user.role, canManageWarehouses, "create storage locations");

    const warehouseId = formData.get("warehouseId") as string;
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;

    if (!warehouseId || !name || !code) {
      return { success: false, error: "Please fill in all location fields." };
    }

    const normalizedCode = code.trim().toUpperCase();

    const existing = await prisma.location.findUnique({
      where: {
        warehouseId_code: {
          warehouseId,
          code: normalizedCode,
        },
      },
    });
    if (existing) {
      return { success: false, error: `Location code '${code}' already exists in this warehouse.` };
    }

    await prisma.$transaction(async (tx) => {
      const loc = await tx.location.create({
        data: {
          warehouseId,
          name: name.trim(),
          code: normalizedCode,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "LOCATION_CREATED",
          entity: "Location",
          entityId: loc.id,
          metadata: { code: loc.code, name: loc.name },
        },
      });
    });

    revalidatePath("/settings/warehouses");
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    console.error("Create location failed:", error);
    return { success: false, error: error.message || "Failed to create location." };
  }
}
