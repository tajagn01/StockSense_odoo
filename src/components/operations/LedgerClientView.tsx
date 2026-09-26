"use client";

import { useState } from "react";
import { Search, History, Download, FileSpreadsheet } from "lucide-react";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF]">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#646981]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product, SKU, reference #, reason..."
            className="w-full bg-[#F2F2ED] border border-[rgba(70,75,113,0.12)] rounded-lg pl-9 pr-4 py-2 text-xs text-[#464B71] placeholder:text-[#646981] focus:outline-none focus:border-[#168FB3]"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] rounded-lg px-3 py-2 text-xs text-[#464B71] focus:outline-none cursor-pointer font-medium"
          >
            <option value="ALL">All Movement Types</option>
            <option value="RECEIPT">Inward Receipts</option>
            <option value="DELIVERY">Outward Deliveries</option>
            <option value="TRANSFER_IN">Transfer In</option>
            <option value="TRANSFER_OUT">Transfer Out</option>
            <option value="ADJUSTMENT">Adjustments</option>
          </select>

          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-[#FFFFFF] hover:bg-[#F2F2ED] text-[#464B71] border border-[rgba(70,75,113,0.15)] shadow-sm transition"
          >
            <Download className="h-3.5 w-3.5 text-[#168FB3]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F2F2ED] text-[11px] uppercase tracking-wider text-[#646981] border-b border-[rgba(70,75,113,0.10)]">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Product & SKU</th>
                <th className="py-3 px-4 font-semibold">Storage Location</th>
                <th className="py-3 px-4 font-semibold">Stock Progression</th>
                <th className="py-3 px-4 font-semibold">Reference Document</th>
                <th className="py-3 px-4 font-semibold">Audit Trail & Reason</th>
                <th className="py-3 px-4 font-semibold text-right">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(70,75,113,0.08)]">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-[#646981]">
                      <FileSpreadsheet className="h-8 w-8 text-[#646981]/50 mb-2" />
                      <p className="font-semibold text-sm text-[#464B71]">No ledger records found</p>
                      <p className="text-xs text-[#646981] mt-0.5">Transactions appear here automatically when stock movements are completed.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEntries.map((e) => {
                  const isPositive = e.quantity > 0;
                  return (
                    <tr key={e.id} className="hover:bg-[#F2F2ED]/60 transition">
                      <td className="py-3 px-4 text-[#646981] whitespace-nowrap font-mono text-[11px]">
                        {new Date(e.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#F2F2ED] text-[#464B71] border border-[rgba(70,75,113,0.10)]">
                          {e.movementType}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#464B71]">{e.product.name}</div>
                        <div className="text-[10px] font-mono text-[#646981]">{e.product.sku}</div>
                      </td>
                      <td className="py-3 px-4 text-[#646981]">
                        {e.location?.name || "Direct Facility"}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold font-mono ${
                              isPositive ? "text-[#168FB3]" : "text-[#464B71]"
                            }`}
                          >
                            {isPositive ? `+${e.quantity}` : e.quantity} {e.product.uom}
                          </span>
                          <span className="text-[10px] text-[#646981] font-mono">
                            ({e.beforeQuantity} → {e.afterQuantity})
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#168FB3] font-semibold text-[11px]">
                        {e.referenceId || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-[#646981] max-w-xs truncate text-[11px]">
                        {e.reason || "Operational movement"}
                      </td>
                      <td className="py-3 px-4 text-right text-[#464B71] font-medium text-[11px]">
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
