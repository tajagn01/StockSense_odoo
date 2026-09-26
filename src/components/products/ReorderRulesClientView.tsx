"use client";

import { useState } from "react";
import Link from "next/link";
import { Repeat, Search, Edit3, ArrowLeft, X, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { updateReorderRuleAction } from "@/app/actions/productActions";

interface ReorderRulesClientViewProps {
  rules: any[];
}

export function ReorderRulesClientView({ rules }: ReorderRulesClientViewProps) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [editingRule, setEditingRule] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enrichedRules = rules.map((r) => {
    const currentStock = r.product.inventory.reduce((sum: number, i: any) => sum + i.quantity, 0);
    let status = "NORMAL";
    if (currentStock === 0) status = "OUT_OF_STOCK";
    else if (currentStock <= r.reorderLevel) status = "LOW_STOCK";

    return {
      ...r,
      currentStock,
      status,
    };
  });

  const filtered = enrichedRules.filter((r) => {
    const matchesSearch =
      r.product.name.toLowerCase().includes(search.toLowerCase()) ||
      r.product.sku.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === "ALL") return true;
    return r.status === filterStatus;
  });

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("ruleId", editingRule.id);

    const res = await updateReorderRuleAction(formData);

    if (res.success) {
      setEditingRule(null);
      window.location.reload();
    } else {
      setError(res.error || "Failed to update reorder rule.");
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OUT_OF_STOCK":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
            <XCircle className="h-3 w-3" />
            Out of Stock
          </span>
        );
      case "LOW_STOCK":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="h-3 w-3" />
            Low Stock
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#73D0C3]/20 text-[#464B71] border border-[#73D0C3]/40">
            <CheckCircle2 className="h-3 w-3 text-[#168FB3]" />
            Optimal Stock
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#464B71]">
              Automated Reorder Rules
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#168FB3]/10 text-[#168FB3] border border-[#168FB3]/20">
              {rules.length} Policies Active
            </span>
          </div>
          <p className="text-xs text-[#646981] mt-1">
            Configure safety replenishment thresholds and restock targets per product.
          </p>
        </div>

        <Link
          href="/products"
          className="flex items-center gap-1.5 px-3 py-2 border border-[rgba(70,75,113,0.15)] bg-white hover:bg-[#F2F2ED] text-xs font-semibold text-[#464B71] rounded-xl transition self-start sm:self-auto"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Catalog
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#646981]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product name or SKU..."
            className="w-full bg-[#F2F2ED] border border-[rgba(70,75,113,0.12)] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#464B71] placeholder:text-[#646981] focus:outline-none focus:border-[#168FB3]"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {["ALL", "LOW_STOCK", "OUT_OF_STOCK", "NORMAL"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filterStatus === st
                  ? "bg-[#168FB3] text-white shadow-xs"
                  : "bg-[#F2F2ED] text-[#646981] hover:text-[#464B71]"
              }`}
            >
              {st === "ALL" ? "All Rules" : st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[rgba(70,75,113,0.10)] bg-[#F2F2ED]/60 text-[#464B71] font-semibold">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4 text-right">Current Available Stock</th>
                <th className="py-3 px-4 text-right">Reorder Threshold</th>
                <th className="py-3 px-4 text-right">Target Batch Quantity</th>
                <th className="py-3 px-4">Health Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(70,75,113,0.06)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#646981]">
                    No reorder rules found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((rule) => (
                  <tr key={rule.id} className="hover:bg-[#F2F2ED]/50 transition">
                    <td className="py-3 px-4 font-semibold text-[#464B71]">
                      <Link href={`/products/${rule.product.id}`} className="hover:text-[#168FB3] hover:underline">
                        {rule.product.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#646981]">{rule.product.sku}</td>
                    <td className="py-3 px-4 text-right font-bold text-[#464B71]">
                      {rule.currentStock} <span className="font-normal text-[#646981]">{rule.product.uom}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-[#464B71]">
                      {rule.reorderLevel} {rule.product.uom}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#168FB3]">
                      +{rule.reorderQuantity} {rule.product.uom}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(rule.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setEditingRule(rule)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F2F2ED] hover:bg-[#168FB3]/10 text-[#168FB3] rounded-lg font-semibold transition"
                      >
                        <Edit3 className="h-3 w-3" />
                        Configure
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configure Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(70,75,113,0.10)] mb-4">
              <h2 className="text-base font-bold text-[#464B71]">Configure Reorder Policy</h2>
              <button onClick={() => setEditingRule(null)} className="p-1 text-[#646981] hover:text-[#464B71]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4 p-3 rounded-xl bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)] text-xs">
              <div className="font-bold text-[#464B71]">{editingRule.product.name}</div>
              <div className="text-[11px] text-[#646981] font-mono">SKU: {editingRule.product.sku}</div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#464B71] mb-1">
                  Reorder Threshold Level ({editingRule.product.uom})
                </label>
                <input
                  type="number"
                  name="reorderLevel"
                  required
                  min="0"
                  defaultValue={editingRule.reorderLevel}
                  className="w-full px-3 py-2 bg-[#F2F2ED]/50 border border-[rgba(70,75,113,0.15)] rounded-xl text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3]"
                />
                <span className="text-[10px] text-[#646981] mt-1 block">
                  Alert triggers when available stock falls at or below this level.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#464B71] mb-1">
                  Target Restock Quantity ({editingRule.product.uom})
                </label>
                <input
                  type="number"
                  name="reorderQuantity"
                  required
                  min="1"
                  defaultValue={editingRule.reorderQuantity}
                  className="w-full px-3 py-2 bg-[#F2F2ED]/50 border border-[rgba(70,75,113,0.15)] rounded-xl text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3]"
                />
                <span className="text-[10px] text-[#646981] mt-1 block">
                  Standard purchase / replenishment order quantity.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-4 py-2 border border-[rgba(70,75,113,0.15)] rounded-xl text-xs font-semibold text-[#646981] hover:bg-[#F2F2ED]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#168FB3] hover:bg-[#127492] text-white text-xs font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Save Policy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
