"use client";

import { useState } from "react";
import { Plus, X, Loader2, SlidersHorizontal, ArrowUpRight, ArrowDownRight, ClipboardCheck } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF]">
        <div>
          <span className="text-xs text-[#646981]">
            Reconcile physical floor counts with electronic records without losing transaction history.
          </span>
        </div>

        <button
          onClick={() => {
            setPhysicalCount(systemQty);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#168FB3] hover:bg-[#127492] text-white shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Physical Count Adjustment</span>
        </button>
      </div>

      {/* Adjustments Table */}
      <div className="rounded-xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F2F2ED] text-[11px] uppercase tracking-wider text-[#646981] border-b border-[rgba(70,75,113,0.10)]">
              <tr>
                <th className="py-3 px-4 font-semibold">Adjustment #</th>
                <th className="py-3 px-4 font-semibold">Product</th>
                <th className="py-3 px-4 font-semibold">Location</th>
                <th className="py-3 px-4 font-semibold">System Stock</th>
                <th className="py-3 px-4 font-semibold">Counted Stock</th>
                <th className="py-3 px-4 font-semibold">Discrepancy</th>
                <th className="py-3 px-4 font-semibold">Reason</th>
                <th className="py-3 px-4 font-semibold text-right">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(70,75,113,0.08)]">
              {adjustments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-[#646981]">
                      <ClipboardCheck className="h-8 w-8 text-[#646981]/50 mb-2" />
                      <p className="font-semibold text-sm text-[#464B71]">No physical count adjustments found</p>
                      <p className="text-xs text-[#646981] mt-0.5">Perform a count reconciliation to record differences.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                adjustments.map((adj) => {
                  const isPositive = adj.difference > 0;
                  const isZero = adj.difference === 0;

                  return (
                    <tr key={adj.id} className="hover:bg-[#F2F2ED]/60 transition">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[#464B71] text-xs">{adj.adjustmentNo}</span>
                        {adj.notes && (
                          <div className="text-[10px] text-[#646981] mt-0.5 truncate max-w-xs">{adj.notes}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#464B71]">{adj.productId}</td>
                      <td className="py-3 px-4 text-[#646981]">{adj.locationId}</td>
                      <td className="py-3 px-4 text-[#646981] font-mono">{adj.systemQuantity}</td>
                      <td className="py-3 px-4 text-[#464B71] font-bold font-mono">{adj.physicalQuantity}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-semibold ${
                            isZero
                              ? "text-[#646981]"
                              : isPositive
                              ? "text-[#168FB3]"
                              : "text-[#464B71]"
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
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F2F2ED] text-[#464B71] border border-[rgba(70,75,113,0.12)]">
                          {adj.reason}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-[#646981] text-[11px]">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-xl bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] shadow-xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(70,75,113,0.10)]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#F2F2ED] text-[#464B71]">
                  <SlidersHorizontal className="h-4 w-4 text-[#168FB3]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#464B71]">Perform Physical Count Adjustment</h3>
                  <p className="text-xs text-[#646981]">Reconcile difference between shelf count and system record</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#646981] hover:text-[#464B71]">
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#464B71]">Product</label>
                  <select
                    name="productId"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    required
                    className="w-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-lg px-3 py-2 text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3]"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#464B71]">Location Counted</label>
                  <select
                    name="locationId"
                    value={selectedLocationId}
                    onChange={(e) => setSelectedLocationId(e.target.value)}
                    required
                    className="w-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-lg px-3 py-2 text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3]"
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
              <div className="p-3.5 rounded-lg bg-[#F2F2ED]/70 border border-[rgba(70,75,113,0.10)] grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="text-[10px] text-[#646981] block uppercase font-medium">System Quantity</span>
                  <span className="text-lg font-bold text-[#464B71] font-mono">{systemQty}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#646981] block uppercase font-medium">Physical Count</span>
                  <span className="text-lg font-bold text-[#464B71] font-mono">{physicalCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#646981] block uppercase font-medium">Difference</span>
                  <span
                    className={`text-lg font-bold font-mono ${
                      difference === 0
                        ? "text-[#646981]"
                        : difference > 0
                        ? "text-[#168FB3]"
                        : "text-[#464B71]"
                    }`}
                  >
                    {difference > 0 ? `+${difference}` : difference}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#464B71]">Counted Shelf Quantity</label>
                  <input
                    name="physicalQuantity"
                    type="number"
                    min="0"
                    value={physicalCount}
                    onChange={(e) => setPhysicalCount(parseInt(e.target.value || "0", 10))}
                    required
                    className="w-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-lg px-3 py-2 text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#464B71]">Adjustment Reason</label>
                  <select
                    name="reason"
                    required
                    className="w-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-lg px-3 py-2 text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3]"
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
                <label className="text-[11px] font-semibold text-[#464B71]">Investigation Notes</label>
                <input
                  name="notes"
                  placeholder="e.g. Broken packaging discovered on bottom rack"
                  className="w-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-lg px-3 py-2 text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[rgba(70,75,113,0.10)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#646981] hover:text-[#464B71] hover:bg-[#F2F2ED] rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#168FB3] hover:bg-[#127492] text-white transition disabled:opacity-50"
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
