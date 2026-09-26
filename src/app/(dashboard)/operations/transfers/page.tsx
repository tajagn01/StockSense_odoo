import { prisma } from "@/lib/prisma";
import { TransfersClientView } from "@/components/operations/TransfersClientView";

export const dynamic = "force-dynamic";

export default async function TransfersPage() {
  const [transfers, locations, products] = await Promise.all([
    prisma.transfer.findMany({
      include: {
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.location.findMany({
      include: { warehouse: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="pb-2 border-b border-[rgba(70,75,113,0.12)]">
        <h1 className="text-2xl font-bold tracking-tight text-[#464B71]">Internal Stock Transfers</h1>
        <p className="text-xs text-[#646981] mt-0.5">
          Relocate stock between warehouses and storage locations while preserving absolute ledger audit integrity.
        </p>
      </div>

      <TransfersClientView
        transfers={transfers}
        locations={locations}
        products={products}
      />
    </div>
  );
}
