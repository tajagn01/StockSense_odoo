import { requireAuth } from "@/lib/auth";
import { User, Shield, Mail, KeyRound, Clock, CheckCircle } from "lucide-react";
import { logoutAction } from "@/app/actions/authActions";

export default async function ProfilePage() {
  const user = await requireAuth();

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Full administrative authority across all facilities, role provisioning, system settings, and complete ledger audits.";
      case "INVENTORY_MANAGER":
        return "Operational management access over products, receipts, deliveries, internal transfers, cycle count adjustments, and reorder policies.";
      case "WAREHOUSE_STAFF":
        return "Shopfloor operations: physical receipts intake, order picking & packing, transfer execution, and physical inventory counts.";
      default:
        return "Workspace operator.";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#464B71]">Operator Profile</h1>
        <p className="text-xs text-[#646981] mt-1">
          Authenticated identity and operational role permissions within StockSense.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(70,75,113,0.10)]">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-[#464B71] text-white font-bold text-xl flex items-center justify-center shadow-sm">
              {getInitials(user.name)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#464B71]">{user.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#168FB3]/10 text-[#168FB3] border border-[#168FB3]/20">
                  <Shield className="h-3 w-3" />
                  {user.role.replace("_", " ")}
                </span>
                <span className="text-xs text-[#646981] flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </span>
              </div>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold rounded-xl transition"
            >
              Sign Out of Session
            </button>
          </form>
        </div>

        {/* Role & Permissions Scope */}
        <div className="pt-6 space-y-4">
          <h3 className="text-xs font-bold text-[#464B71] uppercase tracking-wider">
            Operational Authority Scope
          </h3>
          <p className="text-xs text-[#646981] leading-relaxed">
            {getRoleDescription(user.role)}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)] flex items-start gap-2.5">
              <CheckCircle className="h-4 w-4 text-[#168FB3] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-[#464B71]">Inward & Outward Movements</div>
                <div className="text-[11px] text-[#646981]">
                  Authorized to create, pick, and advance operational workflow states.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)] flex items-start gap-2.5">
              <CheckCircle className="h-4 w-4 text-[#168FB3] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-[#464B71]">Audit Trail & Attribution</div>
                <div className="text-[11px] text-[#646981]">
                  All inventory transactions are cryptographically signed with ID: <code className="font-mono text-[10px]">{user.id}</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
