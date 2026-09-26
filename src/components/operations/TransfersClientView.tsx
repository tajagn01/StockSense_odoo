"use client";

import { useState } from "react";
import { Plus, Check, Loader2, X, ArrowLeftRight, CheckCircle2, Clock } from "lucide-react";
import { createTransferAction, validateTransferAction } from "@/app/actions/transferActions";

interface TransfersClientViewProps {
  transfers: any[];
  locations: Array<{ id: string; name: string; code: string; warehouse: { name: string; code: string } }>;
  products: Array<{ id: string; name: string; sku: string; uom: string }>;
}

export function TransfersClientView({
  transfers,
  locations,
  products,
}: TransfersClientViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const displayTransfers = transfers.filter((t) => {
    if (statusFilter === "ALL") return true;
    return t.status === statusFilter;
  });

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await createTransferAction(formData);

    setIsSubmitting(false);
    if (!res.success) {
      setErrorMessage(res.error || "Failed to schedule transfer.");
    } else {
      setIsModalOpen(false);
    }
  }

  async function handleValidate(id: string) {
    setValidatingId(id);
    const res = await validateTransferAction(id);
    setValidatingId(null);
    if (!res.success) {
      alert(res.error || "Failed to validate transfer.");
    }
  }

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="READY">Ready for Movement</option>
            <option value="DONE">Completed</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-500 text-white shadow-sm shadow-violet-600/30 transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Stock Transfer</span>
        </button>
      </div>

      {/* Transfers Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Transfer Number</th>
                <th className="py-3.5 px-4 font-semibold">Source Route</th>
                <th className="py-3.5 px-4 font-semibold">Destination Route</th>
                <th className="py-3.5 px-4 font-semibold">Transfer Quantity</th>
                <th className="py-3.5 px-4 font-semibold">Created Date</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Transfer Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayTransfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No internal transfers recorded.
                  </td>
                </tr>
              ) : (
                displayTransfers.map((t) => {
                  const isDone = t.status === "DONE";
                  return (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-white text-xs">{t.transferNo}</span>
                        {t.notes && (
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">{t.notes}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px]">
                          {t.sourceLocationId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px]">
                          {t.destinationLocationId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {t.items.map((item: any, i: number) => (
                            <div key={i} className="text-[11px] text-slate-300">
                              <span className="font-semibold text-violet-300">{item.quantity}</span> {item.product.uom}{" "}
                              <span className="text-slate-400">({item.product.name})</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                            <Clock className="h-3 w-3" />
                            {t.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isDone ? (
                          <span className="text-[11px] text-slate-400 font-mono">Relocated ✓</span>
                        ) : (
                          <button
                            onClick={() => handleValidate(t.id)}
                            disabled={validatingId === t.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50"
                          >
                            {validatingId === t.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                            <span>Validate Transfer</span>
                          </button>
                        )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  <ArrowLeftRight className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Schedule Internal Transfer</h3>
                  <p className="text-xs text-slate-400">Relocate stock between warehouses & racks</p>
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
                  <label className="text-[11px] font-medium text-slate-300">Origin / Source Rack</label>
                  <select
                    name="sourceLocationId"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="">Select origin...</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.warehouse.code} — {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">Destination Rack</label>
                  <select
                    name="destinationLocationId"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="">Select destination...</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.warehouse.code} — {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">Product</label>
                  <select
                    name="productId"
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
                  <label className="text-[11px] font-medium text-slate-300">Transfer Quantity</label>
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    defaultValue="10"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Transfer Purpose / Notes</label>
                <input
                  name="notes"
                  placeholder="e.g. Staging for production line assembly"
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
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Schedule Transfer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
