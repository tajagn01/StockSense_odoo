import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { ShieldCheck, History, User, FileText, Clock } from "lucide-react";

export default async function AuditLogPage() {
  await requireRole([UserRole.ADMIN, UserRole.INVENTORY_MANAGER]);

  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });

  const getActionBadge = (action: string) => {
    if (action.includes("VALIDATE") || action.includes("DONE")) {
      return "bg-[#73D0C3]/20 text-[#464B71] border-[#73D0C3]/40";
    }
    if (action.includes("PICK") || action.includes("PACK") || action.includes("TRANSFER")) {
      return "bg-[#168FB3]/10 text-[#168FB3] border-[#168FB3]/20";
    }
    if (action.includes("ADJUSTMENT")) {
      return "bg-[#464B71]/10 text-[#464B71] border-[#464B71]/20";
    }
    return "bg-[#F2F2ED] text-[#646981] border-[rgba(70,75,113,0.15)]";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#464B71]">
              System Audit Trail
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#168FB3]/10 text-[#168FB3] border border-[#168FB3]/20">
              Immutable Records
            </span>
          </div>
          <p className="text-xs text-[#646981] mt-1">
            Tamper-evident operational audit logs tracking all stock movements, validations, and administrative actions.
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[rgba(70,75,113,0.10)] bg-[#F2F2ED]/60 text-[#464B71] font-semibold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Entity Reference</th>
                <th className="py-3 px-4">Metadata / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(70,75,113,0.06)] bg-[#FFFFFF]">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#646981]">
                    <History className="h-8 w-8 text-[#646981]/40 mx-auto mb-2" />
                    No audit logs recorded yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F2F2ED]/50 transition">
                    <td className="py-3 px-4 text-[#646981] whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString([], {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-[#464B71]">{log.user?.name || "System"}</div>
                      <div className="text-[10px] text-[#646981]">{log.user?.email}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#464B71] font-medium whitespace-nowrap">
                      {log.entity}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#168FB3] whitespace-nowrap">
                      {log.entityId}
                    </td>
                    <td className="py-3 px-4 text-[#646981] font-mono text-[11px]">
                      {log.metadata ? JSON.stringify(log.metadata) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
