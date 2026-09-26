import { prisma } from "@/lib/prisma";
import { ReceiptsClientView } from "@/components/operations/ReceiptsClientView";

export const dynamic = "force-dynamic";

export default async function ReceiptsPage() {
  const [receipts, suppliers, warehouses, locations, products] = await Promise.all([
    prisma.receipt.findMany({
      include: {
        supplier: true,
        warehouse: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
    prisma.warehouse.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.location.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-white">Inward Receipts</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Receive incoming vendor consignments, inspect line items, and validate atomic stock increments.
        </p>
      </div>

      <ReceiptsClientView
        receipts={receipts}
        suppliers={suppliers}
        warehouses={warehouses}
        locations={locations}
        products={products}
      />
    </div>
  );
}
