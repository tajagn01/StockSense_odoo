import { Eye, ShieldCheck, Database } from "lucide-react";

export function WhyStockSense() {
  const pillars = [
    {
      num: "01",
      title: "Operational clarity",
      desc: "Zero ambiguity on the warehouse floor. Statuses are strict (Ready, Picking, Packed, Done) and every worker sees exactly which shelf or bin needs attention.",
      icon: Eye,
      highlight: "Clean interfaces built for physical warehouse throughput.",
    },
    {
      num: "02",
      title: "Reliable inventory control",
      desc: "Concurrency-safe database architecture. Atomic conditional updates ensure stock can never drop below zero, double validations are blocked, and total stock is conserved.",
      icon: Database,
      highlight: "Mathematical accuracy derived directly from PostgreSQL RETURNING queries.",
    },
    {
      num: "03",
      title: "Controlled access & traceability",
      desc: "Strict role-based permissions keep administrative catalog rules protected while giving staff rapid shopfloor execution. An append-only ledger tracks every single unit movement.",
      icon: ShieldCheck,
      highlight: "Complete attribution linking movements to exact users and documents.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#FFFFFF] border-t border-[rgba(70,75,113,0.10)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-[#168FB3] font-bold">
            The Three Pillars
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#464B71] tracking-tight">
            Simple enough for the warehouse. Powerful enough for the operation.
          </h2>
          <p className="text-sm sm:text-base text-[#646981] leading-relaxed">
            Engineered to eliminate the traditional tradeoff between complex, bloated ERP systems and fragile, unverified spreadsheets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.num}
                className="rounded-2xl border border-[rgba(70,75,113,0.12)] bg-[#F2F2ED]/40 p-8 flex flex-col justify-between space-y-6 hover:border-[rgba(70,75,113,0.25)] transition group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-extrabold text-[#168FB3]">
                      {pillar.num}
                    </span>
                    <div className="h-10 w-10 rounded-xl bg-[#464B71]/10 flex items-center justify-center text-[#464B71] group-hover:bg-[#168FB3]/15 group-hover:text-[#168FB3] transition">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-[#464B71]">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#646981] leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[rgba(70,75,113,0.08)] text-xs font-semibold text-[#464B71]">
                  {pillar.highlight}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
