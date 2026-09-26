import { prisma } from "@/lib/prisma";
import { AdjustmentsClientView } from "@/components/operations/AdjustmentsClientView";

export const dynamic = "force-dynamic";

export default async function AdjustmentsPage() {
  const [adjustments, products, locations] = await Promise.all([
    prisma.stockAdjustment.findMany({
      include: {
        createdBy: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      include: {
        inventory: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      include: { warehouse: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-white">Stock Adjustments</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Perform cycle counting reconciliation, log reason codes, and update inventory with permanent ledger audit records.
        </p>
      </div>

      <AdjustmentsClientView
        adjustments={adjustments}
        products={products}
        locations={locations}
      />
    </div>
  );
}
