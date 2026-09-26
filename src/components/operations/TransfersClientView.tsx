"use client";

import { useState } from "react";
import { Plus, Check, Loader2, X, ArrowLeftRight, CheckCircle2, Clock, MoveRight } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF]">
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#646981] font-medium">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] rounded-lg px-3 py-1.5 text-xs text-[#464B71] focus:outline-none cursor-pointer font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="READY">Ready for Movement</option>
            <option value="DONE">Completed</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#168FB3] hover:bg-[#127492] text-white shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Stock Transfer</span>
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F2F2ED] text-[11px] uppercase tracking-wider text-[#646981] border-b border-[rgba(70,75,113,0.10)]">
              <tr>
                <th className="py-3 px-4 font-semibold">Transfer Number</th>
                <th className="py-3 px-4 font-semibold">Source Route</th>
                <th className="py-3 px-4 font-semibold">Destination Route</th>
                <th className="py-3 px-4 font-semibold">Quantity</th>
                <th className="py-3 px-4 font-semibold">Created Date</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(70,75,113,0.08)]">
              {displayTransfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-[#646981]">
                      <ArrowLeftRight className="h-8 w-8 text-[#646981]/50 mb-2" />
                      <p className="font-semibold text-sm text-[#464B71]">No stock transfers found</p>
                      <p className="text-xs text-[#646981] mt-0.5">Transfer stock between warehouses and storage bins.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayTransfers.map((t) => {
                  const isDone = t.status === "DONE";
                  return (
                    <tr key={t.id} className="hover:bg-[#F2F2ED]/60 transition">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[#464B71] text-xs">{t.transferNo}</span>
                        {t.notes && (
                          <div className="text-[10px] text-[#646981] mt-0.5 truncate max-w-xs">{t.notes}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#464B71]">
                        <span className="px-2 py-0.5 rounded bg-[#F2F2ED] border border-[rgba(70,75,113,0.10)] text-[11px] font-medium">
                          {t.sourceLocationId}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#464B71]">
                        <span className="px-2 py-0.5 rounded bg-[#F2F2ED] border border-[rgba(70,75,113,0.10)] text-[11px] font-medium">
                          {t.destinationLocationId}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {t.items.map((item: any, i: number) => (
                            <div key={i} className="text-[11px] text-[#464B71]">
                              <span className="font-bold">{item.quantity}</span> {item.product.uom}{" "}
                              <span className="text-[#646981]">({item.product.name})</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#646981]">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#73D0C3]/25 text-[#464B71] border border-[#73D0C3]/40">
                            <CheckCircle2 className="h-3 w-3 text-[#168FB3]" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#168FB3]/10 text-[#168FB3] border border-[#168FB3]/20">
                            <Clock className="h-3 w-3" />
                            {t.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isDone ? (
                          <span className="text-[11px] text-[#646981] font-mono">Relocated ✓</span>
                        ) : (
                          <button
                            onClick={() => handleValidate(t.id)}
                            disabled={validatingId === t.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#168FB3] hover:bg-[#127492] text-white transition disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-xl bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] shadow-xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(70,75,113,0.10)]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#F2F2ED] text-[#464B71]">
                  <ArrowLeftRight className="h-4 w-4 text-[#168FB3]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#464B71]">Schedule Internal Transfer</h3>
                  <p className="text-xs text-[#646981]">Relocate stock between warehouses & racks</p>
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
                  <label className="text-[11px] font-semibold text-[#464B71]">Origin / Source Rack</label>
                  <select
                    name="sourceLocationId"
                    required
                    className="w-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-lg px-3 py-2 text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3]"
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
                  <label className="text-[11px] font-semibold text-[#464B71]">Destination Rack</label>
                  <select
                    name="destinationLocationId"
                    required
                    className="w-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-lg px-3 py-2 text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3]"
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
                  <label className="text-[11px] font-semibold text-[#464B71]">Product</label>
                  <select
                    name="productId"
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
                  <label className="text-[11px] font-semibold text-[#464B71]">Transfer Quantity</label>
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    defaultValue="10"
                    required
                    className="w-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-lg px-3 py-2 text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#464B71]">Transfer Purpose / Notes</label>
                <input
                  name="notes"
                  placeholder="e.g. Staging for production line assembly"
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
