import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Boxes, Warehouse, History, Sliders, AlertTriangle } from "lucide-react";
import { ProductDetailClientView } from "@/components/products/ProductDetailClientView";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories, warehouses] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reorderRules: true,
        inventory: {
          include: {
            warehouse: true,
            location: true,
          },
        },
        ledger: {
          orderBy: { createdAt: "desc" },
          take: 25,
          include: {
            user: { select: { name: true, email: true } },
            location: true,
          },
        },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.warehouse.findMany({
      where: { isActive: true },
      include: { locations: true },
    }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailClientView
      product={product}
      categories={categories}
      warehouses={warehouses}
    />
  );
}
