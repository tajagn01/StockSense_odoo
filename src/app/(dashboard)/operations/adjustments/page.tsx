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
      <div className="pb-2 border-b border-[rgba(70,75,113,0.12)]">
        <h1 className="text-2xl font-bold tracking-tight text-[#464B71]">Stock Adjustments</h1>
        <p className="text-xs text-[#646981] mt-0.5">
          Execute physical cycle counting, identify variance discrepancies, and record atomic balance updates with reason tracking.
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
