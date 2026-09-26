"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "Product" | "Receipt" | "Delivery" | "Transfer" | "Warehouse" | "Location";
  url: string;
}

export async function searchWorkspaceAction(query: string): Promise<SearchResult[]> {
  // Enforce session authentication on global operational search
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  const q = query.trim();
  if (!q || q.length < 2) return [];

  const results: SearchResult[] = [];

  try {
    const [products, receipts, deliveries, transfers, warehouses, locations] = await Promise.all([
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: { id: true, name: true, sku: true, uom: true },
      }),
      prisma.receipt.findMany({
        where: {
          receiptNo: { contains: q, mode: "insensitive" },
        },
        take: 4,
        select: { id: true, receiptNo: true, status: true },
      }),
      prisma.delivery.findMany({
        where: {
          deliveryNo: { contains: q, mode: "insensitive" },
        },
        take: 4,
        select: { id: true, deliveryNo: true, status: true },
      }),
      prisma.transfer.findMany({
        where: {
          transferNo: { contains: q, mode: "insensitive" },
        },
        take: 4,
        select: { id: true, transferNo: true, status: true },
      }),
      prisma.warehouse.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { code: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 3,
        select: { id: true, name: true, code: true },
      }),
      prisma.location.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { code: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 4,
        select: {
          id: true,
          name: true,
          code: true,
          warehouse: { select: { name: true, code: true } },
        },
      }),
    ]);

    products.forEach((p) => {
      results.push({
        id: p.id,
        title: p.name,
        subtitle: `SKU: ${p.sku} • UOM: ${p.uom}`,
        type: "Product",
        url: `/products/${p.id}`,
      });
    });

    receipts.forEach((r) => {
      results.push({
        id: r.id,
        title: r.receiptNo,
        subtitle: `Status: ${r.status}`,
        type: "Receipt",
        url: `/operations/receipts`,
      });
    });

    deliveries.forEach((d) => {
      results.push({
        id: d.id,
        title: d.deliveryNo,
        subtitle: `Status: ${d.status}`,
        type: "Delivery",
        url: `/operations/deliveries`,
      });
    });

    transfers.forEach((t) => {
      results.push({
        id: t.id,
        title: t.transferNo,
        subtitle: `Status: ${t.status}`,
        type: "Transfer",
        url: `/operations/transfers`,
      });
    });

    warehouses.forEach((w) => {
      results.push({
        id: w.id,
        title: w.name,
        subtitle: `Facility Code: ${w.code}`,
        type: "Warehouse",
        url: `/settings/warehouses`,
      });
    });

    locations.forEach((l) => {
      results.push({
        id: l.id,
        title: l.name,
        subtitle: `Location: ${l.code} • In: ${l.warehouse.name} (${l.warehouse.code})`,
        type: "Location",
        url: `/settings/warehouses`,
      });
    });
  } catch (error) {
    console.error("Global search error:", error);
  }

  return results;
}
