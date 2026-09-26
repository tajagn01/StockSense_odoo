"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createWarehouseAction(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const address = (formData.get("address") as string) || null;

    if (!name || !code) {
      return { success: false, error: "Name and warehouse code are required." };
    }

    const existing = await prisma.warehouse.findUnique({
      where: { code: code.trim().toUpperCase() },
    });
    if (existing) {
      return { success: false, error: `Warehouse code '${code}' already exists.` };
    }

    await prisma.warehouse.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        address: address?.trim(),
      },
    });

    revalidatePath("/settings/warehouses");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Create warehouse failed:", error);
    return { success: false, error: error.message || "Failed to create warehouse." };
  }
}

export async function createLocationAction(formData: FormData) {
  try {
    const warehouseId = formData.get("warehouseId") as string;
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;

    if (!warehouseId || !name || !code) {
      return { success: false, error: "Please fill in all location fields." };
    }

    const existing = await prisma.location.findUnique({
      where: {
        warehouseId_code: {
          warehouseId,
          code: code.trim().toUpperCase(),
        },
      },
    });
    if (existing) {
      return { success: false, error: `Location code '${code}' already exists in this warehouse.` };
    }

    await prisma.location.create({
      data: {
        warehouseId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
      },
    });

    revalidatePath("/settings/warehouses");
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    console.error("Create location failed:", error);
    return { success: false, error: error.message || "Failed to create location." };
  }
}
