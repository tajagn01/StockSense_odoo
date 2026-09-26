import {
  Boxes,
  Warehouse,
  Truck,
  ArrowLeftRight,
  History,
  ShieldCheck,
} from "lucide-react";

export function ProductPositioning() {
  const capabilities = [
    {
      icon: Boxes,
      title: "Inventory",
      desc: "Live SKU tracking, multi-bin allocations, and automated low-stock reorder thresholds.",
    },
    {
      icon: Warehouse,
      title: "Warehouses",
      desc: "Multi-facility topology with precise zones, aisles, racks, and bin locations.",
    },
    {
      icon: Truck,
      title: "Fulfillment",
      desc: "Structured pick-and-pack workflow from order staging to atomic dispatch.",
    },
    {
      icon: ArrowLeftRight,
      title: "Transfers",
      desc: "Internal stock relocation with guaranteed zero net variance and balanced dual entries.",
    },
    {
      icon: History,
      title: "Auditability",
      desc: "Immutable stock ledger recording exact before/after balances and user attribution.",
    },
    {
      icon: ShieldCheck,
      title: "Access Control",
      desc: "Enforced server-side permissions for Admin, Inventory Manager, and Warehouse Staff.",
    },
  ];

  return (
    <section className="py-16 border-y border-[rgba(70,75,113,0.10)] bg-[#FFFFFF]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-[11px] font-mono uppercase tracking-widest text-[#168FB3] font-bold">
            Operational Capabilities
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#464B71] mt-2">
            Built for teams that need inventory they can trust.
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)] hover:border-[rgba(70,75,113,0.20)] hover:bg-[#FFFFFF] transition group"
              >
                <div className="h-8 w-8 rounded-lg bg-[#464B71]/10 flex items-center justify-center text-[#464B71] group-hover:bg-[#168FB3]/15 group-hover:text-[#168FB3] transition mb-3">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-bold text-[#464B71] mb-1">{cap.title}</h3>
                <p className="text-[11px] text-[#646981] leading-relaxed">{cap.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
