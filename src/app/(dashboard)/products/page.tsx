import { prisma } from "@/lib/prisma";
import { CreateProductModal } from "@/components/products/CreateProductModal";
import { ProductListTable } from "@/components/products/ProductListTable";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, categories, locations] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
        inventory: {
          include: { location: true, warehouse: true },
        },
        reorderRules: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      include: { warehouse: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Product & Inventory Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage product items, SKU identifiers, location assignments, and stock replenishment limits.
          </p>
        </div>

        <CreateProductModal categories={categories} locations={locations} />
      </div>

      {/* Main Table */}
      <ProductListTable products={products} />
    </div>
  );
}
