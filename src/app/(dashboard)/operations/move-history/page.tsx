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
      <div className="pb-2 border-b border-[rgba(70,75,113,0.12)]">
        <h1 className="text-2xl font-bold tracking-tight text-[#464B71]">Stock Ledger</h1>
        <p className="text-xs text-[#646981] mt-0.5">
          Immutable historical audit log tracking every inventory transaction, quantity alteration, and user attribution.
        </p>
      </div>

      <LedgerClientView entries={entries} />
    </div>
  );
}
