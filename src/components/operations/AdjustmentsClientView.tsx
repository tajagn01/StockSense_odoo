"use client";

import { useState } from "react";
import { Plus, X, Loader2, SlidersHorizontal, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { createAdjustmentAction } from "@/app/actions/adjustmentActions";

interface AdjustmentsClientViewProps {
  adjustments: any[];
  products: any[];
  locations: any[];
}

export function AdjustmentsClientView({
  adjustments,
  products,
  locations,
}: AdjustmentsClientViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || "");
  const [selectedLocationId, setSelectedLocationId] = useState(locations[0]?.id || "");
  const [physicalCount, setPhysicalCount] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute system stock for selected product & location
  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const existingInventory = selectedProduct?.inventory?.find(
    (inv: any) => inv.locationId === selectedLocationId
  );
  const systemQty = existingInventory ? existingInventory.quantity : 0;
  const difference = physicalCount - systemQty;

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await createAdjustmentAction(formData);

    setIsSubmitting(false);
    if (!res.success) {
      setErrorMessage(res.error || "Failed to submit adjustment.");
    } else {
      setIsModalOpen(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/50">
        <div>
          <span className="text-xs text-slate-400">
            Reconcile physical floor counts with electronic records without losing transaction history.
          </span>
        </div>

        <button
          onClick={() => {
            setPhysicalCount(systemQty);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-sm shadow-amber-600/30 transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Physical Count Adjustment</span>
        </button>
      </div>

      {/* Adjustments Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Adjustment #</th>
                <th className="py-3.5 px-4 font-semibold">Product</th>
                <th className="py-3.5 px-4 font-semibold">Location</th>
                <th className="py-3.5 px-4 font-semibold">System Stock</th>
                <th className="py-3.5 px-4 font-semibold">Counted Stock</th>
                <th className="py-3.5 px-4 font-semibold">Discrepancy</th>
                <th className="py-3.5 px-4 font-semibold">Reason</th>
                <th className="py-3.5 px-4 font-semibold text-right">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {adjustments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No physical count adjustments on record.
                  </td>
                </tr>
              ) : (
                adjustments.map((adj) => {
                  const isPositive = adj.difference > 0;
                  const isZero = adj.difference === 0;

                  return (
                    <tr key={adj.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-white text-xs">{adj.adjustmentNo}</span>
                        {adj.notes && (
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">{adj.notes}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white">{adj.productId}</td>
                      <td className="py-3.5 px-4 text-slate-300">{adj.locationId}</td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono">{adj.systemQuantity}</td>
                      <td className="py-3.5 px-4 text-white font-bold font-mono">{adj.physicalQuantity}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-semibold ${
                            isZero
                              ? "text-slate-400"
                              : isPositive
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {isPositive ? `+${adj.difference}` : adj.difference}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {adj.reason}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400 text-[11px]">
                        {adj.createdBy?.name || "System"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <SlidersHorizontal className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Perform Physical Count Adjustment</h3>
                  <p className="text-xs text-slate-400">Reconcile difference between shelf count and system</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">Product</label>
                  <select
                    name="productId"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">Location Counted</label>
                  <select
                    name="locationId"
                    value={selectedLocationId}
                    onChange={(e) => setSelectedLocationId(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.warehouse.code} — {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Real-time discrepancy calculation card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">System Quantity</span>
                  <span className="text-lg font-bold text-slate-300 font-mono">{systemQty}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Physical Count</span>
                  <span className="text-lg font-bold text-white font-mono">{physicalCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Difference</span>
                  <span
                    className={`text-lg font-bold font-mono ${
                      difference === 0
                        ? "text-slate-400"
                        : difference > 0
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {difference > 0 ? `+${difference}` : difference}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">Counted Shelf Quantity</label>
                  <input
                    name="physicalQuantity"
                    type="number"
                    min="0"
                    value={physicalCount}
                    onChange={(e) => setPhysicalCount(parseInt(e.target.value || "0", 10))}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">Adjustment Reason</label>
                  <select
                    name="reason"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="COUNTING_ERROR">Counting Error</option>
                    <option value="DAMAGED">Damaged Goods</option>
                    <option value="LOST">Lost / Unaccounted</option>
                    <option value="FOUND">Found Extra Stock</option>
                    <option value="EXPIRED">Expired / Obsolete</option>
                    <option value="OTHER">Other Reason</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Investigation Notes</label>
                <input
                  name="notes"
                  placeholder="e.g. Broken packaging discovered on bottom rack"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Commit Adjustment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
