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
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-white">Internal Stock Transfers</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Move inventory between warehouses and storage locations while preserving ledger integrity.
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
