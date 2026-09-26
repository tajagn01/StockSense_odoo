import { XCircle, CheckCircle2, ArrowRight } from "lucide-react";

export function ProblemSection() {
  const problems = [
    {
      title: "Stock scattered across locations",
      problem: "No single view of what is sitting in Central Warehouse vs. East Depot or specific bin shelves.",
      solution: "Hierarchical multi-warehouse topology with discrete bin and zone allocations.",
    },
    {
      title: "Manual inventory updates",
      problem: "Sheets overwritten by multiple staff simultaneously, leading to race conditions and phantom stock.",
      solution: "PostgreSQL atomic conditional updates with exact returned quantities.",
    },
    {
      title: "No clear movement history",
      problem: "Discrepancies discovered days later with zero idea of who moved, received, or adjusted the stock.",
      solution: "Immutable chronological stock ledger linking every unit mutation to an exact document and user.",
    },
    {
      title: "Slow fulfillment workflows",
      problem: "Warehouse workers grab inventory without staged picking or packing verification.",
      solution: "Structured 4-stage pipeline: Ready → Picking → Packed → Done with validation guards.",
    },
    {
      title: "Unclear ownership & access",
      problem: "Anyone with spreadsheet access can accidentally delete rows, change counts, or tamper with history.",
      solution: "Role-based access control strictly partitioning Admin, Manager, and Staff privileges.",
    },
    {
      title: "Painful cycle count reconciliation",
      problem: "Manual stock audits overwrite legitimate concurrent inbound shipments or orders.",
      solution: "Protected row-level locking (SELECT ... FOR UPDATE) during cycle count reconciliation.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#F2F2ED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-[#168FB3] font-bold">
            The Operational Reality
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#464B71] tracking-tight">
            Your inventory shouldn&apos;t live in spreadsheets.
          </h2>
          <p className="text-sm sm:text-base text-[#646981] leading-relaxed">
            Manual spreadsheets create phantom stock, delayed shipments, and agonizing audits.
            StockSense replaces fragmented manual records with one unified, concurrency-safe operational system.
          </p>
        </div>

        {/* Side-by-Side Comparison Transformation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] p-6 shadow-xs flex flex-col justify-between space-y-5"
            >
              <div>
                <h3 className="text-sm font-bold text-[#464B71] mb-4 pb-2 border-b border-[rgba(70,75,113,0.06)]">
                  {item.title}
                </h3>

                {/* Legacy Problem */}
                <div className="flex items-start gap-2.5 mb-3.5">
                  <XCircle className="h-4 w-4 text-[#464B71]/40 shrink-0 mt-0.5" />
                  <p className="text-xs text-[#646981] leading-relaxed">
                    {item.problem}
                  </p>
                </div>

                {/* StockSense Solution */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F2F2ED]/70 border border-[rgba(70,75,113,0.08)]">
                  <CheckCircle2 className="h-4 w-4 text-[#168FB3] shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-[#464B71] leading-relaxed">
                    {item.solution}
                  </p>
                </div>
              </div>

              <div className="text-[10px] font-mono text-[#646981] flex items-center gap-1.5 pt-1">
                <span className="font-semibold text-[#168FB3]">StockSense Standard</span>
                <ArrowRight className="h-3 w-3 text-[#168FB3]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
