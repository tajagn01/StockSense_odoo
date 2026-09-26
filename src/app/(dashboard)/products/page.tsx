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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[rgba(70,75,113,0.12)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#464B71]">
            Products & Stock
          </h1>
          <p className="text-xs text-[#646981] mt-0.5">
            Manage product items, SKU identifiers, warehouse allocation, and minimum reorder rules.
          </p>
        </div>

        <CreateProductModal categories={categories} locations={locations} />
      </div>

      {/* Main Table */}
      <ProductListTable products={products} />
    </div>
  );
}
