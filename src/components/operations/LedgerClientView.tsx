"use client";

import { useState } from "react";
import { Search, Filter, History, ArrowUpRight, ArrowDownRight, ArrowLeftRight, Download } from "lucide-react";

interface LedgerClientViewProps {
  entries: any[];
}

export function LedgerClientView({ entries }: LedgerClientViewProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const filteredEntries = entries.filter((e) => {
    const matchesSearch =
      e.product.name.toLowerCase().includes(search.toLowerCase()) ||
      e.product.sku.toLowerCase().includes(search.toLowerCase()) ||
      (e.referenceId && e.referenceId.toLowerCase().includes(search.toLowerCase())) ||
      (e.reason && e.reason.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === "ALL" || e.movementType === typeFilter;

    return matchesSearch && matchesType;
  });

  function exportCSV() {
    const headers = [
      "Timestamp",
      "Movement Type",
      "Product Name",
      "SKU",
      "Location",
      "Before Qty",
      "Movement Qty",
      "After Qty",
      "Reference ID",
      "Reason",
      "User",
    ];

    const rows = filteredEntries.map((e) => [
      new Date(e.createdAt).toISOString(),
      e.movementType,
      `"${e.product.name}"`,
      e.product.sku,
      `"${e.location?.name || "N/A"}"`,
      e.beforeQuantity,
      e.quantity,
      e.afterQuantity,
      e.referenceId || "N/A",
      `"${e.reason || "N/A"}"`,
      `"${e.user.name}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `stocksense_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-4">
      {/* Search & Type Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/50">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product, SKU, reference #, reason..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Movement Types</option>
            <option value="RECEIPT">Receipts (Inward)</option>
            <option value="DELIVERY">Deliveries (Outward)</option>
            <option value="TRANSFER_IN">Transfer In</option>
            <option value="TRANSFER_OUT">Transfer Out</option>
            <option value="ADJUSTMENT">Adjustments</option>
          </select>

          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                <th className="py-3.5 px-4 font-semibold">Movement Type</th>
                <th className="py-3.5 px-4 font-semibold">Product & SKU</th>
                <th className="py-3.5 px-4 font-semibold">Storage Location</th>
                <th className="py-3.5 px-4 font-semibold">Stock Progression</th>
                <th className="py-3.5 px-4 font-semibold">Reference Document</th>
                <th className="py-3.5 px-4 font-semibold">Reason & Audit Trail</th>
                <th className="py-3.5 px-4 font-semibold text-right">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No transactions match your search or filter.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((e) => {
                  const isPositive = e.quantity > 0;
                  return (
                    <tr key={e.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {new Date(e.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            e.movementType === "RECEIPT"
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                              : e.movementType === "DELIVERY"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : e.movementType === "ADJUSTMENT"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                          }`}
                        >
                          {e.movementType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{e.product.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{e.product.sku}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {e.location?.name || "Direct Hub"}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold font-mono ${
                              isPositive ? "text-cyan-400" : "text-rose-400"
                            }`}
                          >
                            {isPositive ? `+${e.quantity}` : e.quantity} {e.product.uom}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({e.beforeQuantity} → {e.afterQuantity})
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-indigo-300 text-[11px]">
                        {e.referenceId || "N/A"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate text-[11px]">
                        {e.reason || "Operational stock movement"}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-300 text-[11px]">
                        {e.user.name}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
