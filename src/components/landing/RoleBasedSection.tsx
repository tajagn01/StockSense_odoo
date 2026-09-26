import { ShieldAlert, UserCheck, HardHat, Check } from "lucide-react";

export function RoleBasedSection() {
  const roles = [
    {
      role: "ADMIN",
      badge: "Full Control",
      title: "Executive & Administrative Oversight",
      desc: "Architects the operational workspace, defines multi-facility boundaries, manages user provisioning, and accesses complete system audit trails.",
      icon: ShieldAlert,
      permissions: [
        "Create & archive warehouses and storage bins",
        "Define master product catalog & categories",
        "Manage operator roles and access credentials",
        "Inspect complete chronological system audit logs",
        "Override emergency reorder policies",
      ],
      color: "bg-[#464B71] text-white",
      tagColor: "bg-[#73D0C3]/20 text-[#73D0C3]",
      checkColor: "text-[#73D0C3]",
    },
    {
      role: "INVENTORY MANAGER",
      badge: "Operational Oversight",
      title: "Warehouse & Material Governance",
      desc: "Supervises ongoing material velocity, validates receipts and delivery dispatches, establishes reorder thresholds, and executes cycle count adjustments.",
      icon: UserCheck,
      permissions: [
        "Validate inward receipts from suppliers",
        "Authorize and dispatch packed delivery orders",
        "Perform row-locked physical stock adjustments",
        "Configure safety stock and reorder point rules",
        "Monitor low-stock alerts and location capacity",
      ],
      color: "bg-[#FFFFFF] text-[#464B71]",
      tagColor: "bg-[#168FB3]/15 text-[#168FB3]",
      checkColor: "text-[#168FB3]",
    },
    {
      role: "WAREHOUSE STAFF",
      badge: "Shopfloor Execution",
      title: "Rapid Material Handling",
      desc: "Focused, distraction-free interface for dock receiving, physical line-item picking, packing, and bin-to-bin internal transfers.",
      icon: HardHat,
      permissions: [
        "Log and inspect incoming vendor shipments",
        "Advance delivery orders through picking stages",
        "Verify item quantities and pack orders",
        "Execute internal bin and facility transfers",
        "Access fast global search via Ctrl+K",
      ],
      color: "bg-[#FFFFFF] text-[#464B71]",
      tagColor: "bg-[#464B71]/10 text-[#464B71]",
      checkColor: "text-[#73D0C3]",
    },
  ];

  return (
    <section id="roles" className="py-20 md:py-28 bg-[#F2F2ED] border-t border-[rgba(70,75,113,0.10)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-[#168FB3] font-bold">
            Role-Based Access Control
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#464B71] tracking-tight">
            Everyone sees what they need.
          </h2>
          <p className="text-sm sm:text-base text-[#646981] leading-relaxed">
            Tailored permissions empower the shopfloor to move fast without compromising administrative control or master data integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {roles.map((r, idx) => {
            const Icon = r.icon;
            const isDark = idx === 0;
            return (
              <div
                key={r.role}
                className={`rounded-2xl border border-[rgba(70,75,113,0.14)] p-7 flex flex-col justify-between space-y-6 shadow-sm ${
                  isDark ? "bg-[#464B71] text-white" : "bg-[#FFFFFF] text-[#464B71]"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${r.tagColor}`}>
                      {r.badge}
                    </span>
                    <Icon className={`h-5 w-5 ${isDark ? "text-[#73D0C3]" : "text-[#168FB3]"}`} />
                  </div>

                  <div>
                    <h3 className="text-xs font-mono font-bold tracking-wider opacity-70">
                      ROLE: {r.role}
                    </h3>
                    <h4 className="text-xl font-bold mt-1">
                      {r.title}
                    </h4>
                  </div>

                  <p className={`text-xs leading-relaxed ${isDark ? "text-white/80" : "text-[#646981]"}`}>
                    {r.desc}
                  </p>

                  <div className={`pt-4 border-t ${isDark ? "border-white/10" : "border-[rgba(70,75,113,0.08)]"}`}>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider block mb-3 opacity-90">
                      Granted Permissions:
                    </span>
                    <ul className="space-y-2.5 text-xs">
                      {r.permissions.map((p, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check className={`h-4 w-4 shrink-0 mt-0.5 ${r.checkColor}`} />
                          <span className={isDark ? "text-white/90" : "text-[#464B71]"}>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className={`text-[10px] font-mono ${isDark ? "text-white/60" : "text-[#646981]"}`}>
                  Guarded by server-side RBAC middleware
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
