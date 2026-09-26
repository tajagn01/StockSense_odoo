import { prisma } from "@/lib/prisma";
import { LedgerClientView } from "@/components/operations/LedgerClientView";

export const dynamic = "force-dynamic";

export default async function MoveHistoryPage() {
  const entries = await prisma.stockLedger.findMany({
    include: {
      product: true,
      location: true,
      user: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-white">Stock Ledger & Move History</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Immutable historical audit log tracking every inventory transaction, quantity alteration, and user action.
        </p>
      </div>

      <LedgerClientView entries={entries} />
    </div>
  );
}
