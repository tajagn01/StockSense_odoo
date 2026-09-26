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
      <div className="pb-2 border-b border-[rgba(70,75,113,0.12)]">
        <h1 className="text-2xl font-bold tracking-tight text-[#464B71]">Inward Receipts</h1>
        <p className="text-xs text-[#646981] mt-0.5">
          Process incoming vendor shipments, verify item quantities, and validate immediate stock increments.
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
