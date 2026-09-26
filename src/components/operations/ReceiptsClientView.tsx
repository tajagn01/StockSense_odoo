"use client";

import { useState } from "react";
import { Plus, Check, Loader2, X, ArrowDownToLine, CheckCircle2, Clock } from "lucide-react";
import { createReceiptAction, validateReceiptAction } from "@/app/actions/receiptActions";

interface ReceiptsClientViewProps {
  receipts: any[];
  suppliers: Array<{ id: string; name: string }>;
  warehouses: Array<{ id: string; name: string; code: string }>;
  locations: Array<{ id: string; name: string; code: string; warehouseId: string }>;
  products: Array<{ id: string; name: string; sku: string; uom: string }>;
}

export function ReceiptsClientView({
  receipts,
  suppliers,
  warehouses,
  locations,
  products,
}: ReceiptsClientViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(warehouses[0]?.id || "");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Available locations for chosen warehouse
  const filteredLocations = locations.filter((l) => l.warehouseId === selectedWarehouse);

  // Filter receipts
  const displayReceipts = receipts.filter((r) => {
    if (statusFilter === "ALL") return true;
    return r.status === statusFilter;
  });

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await createReceiptAction(formData);

    setIsSubmitting(false);
    if (!res.success) {
      setErrorMessage(res.error || "Failed to create receipt.");
    } else {
      setIsModalOpen(false);
    }
  }

  async function handleValidate(id: string) {
    setValidatingId(id);
    const res = await validateReceiptAction(id);
    setValidatingId(null);
    if (!res.success) {
      alert(res.error || "Failed to validate receipt.");
    }
  }

  return (
    <div className="space-y-4">
      {/* Action Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="READY">Ready for Inwarding</option>
            <option value="DONE">Completed & Validated</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm shadow-cyan-600/30 transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Inward Receipt</span>
        </button>
      </div>

      {/* Receipts Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Receipt Number</th>
                <th className="py-3.5 px-4 font-semibold">Supplier</th>
                <th className="py-3.5 px-4 font-semibold">Target Warehouse</th>
                <th className="py-3.5 px-4 font-semibold">Items & Qty</th>
                <th className="py-3.5 px-4 font-semibold">Created Date</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Validation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayReceipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No receipts recorded under this filter.
                  </td>
                </tr>
              ) : (
                displayReceipts.map((receipt) => {
                  const isDone = receipt.status === "DONE";
                  return (
                    <tr key={receipt.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-white text-xs">{receipt.receiptNo}</span>
                        {receipt.notes && (
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">{receipt.notes}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        {receipt.supplier?.name || "Direct Inward"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {receipt.warehouse.name} ({receipt.warehouse.code})
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {receipt.items.map((item: any, i: number) => (
                            <div key={i} className="text-[11px] text-slate-300">
                              <span className="font-semibold text-white">+{item.quantity}</span> {item.product.uom}{" "}
                              <span className="text-slate-400">({item.product.name})</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(receipt.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" />
                            Done (In Stock)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            <Clock className="h-3 w-3" />
                            {receipt.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isDone ? (
                          <span className="text-[11px] text-slate-400 font-mono">Stock Updated ✓</span>
                        ) : (
                          <button
                            onClick={() => handleValidate(receipt.id)}
                            disabled={validatingId === receipt.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50"
                          >
                            {validatingId === receipt.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                            <span>Validate & Receive</span>
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

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <ArrowDownToLine className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create Inward Stock Receipt</h3>
                  <p className="text-xs text-slate-400">Receive goods from vendor into warehouse</p>
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
                  <label className="text-[11px] font-medium text-slate-300">Supplier</label>
                  <select
                    name="supplierId"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">Warehouse</label>
                  <select
                    name="warehouseId"
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">Target Location / Rack</label>
                  <select
                    name="locationId"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {filteredLocations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.code})
                      </option>
                    ))}
                  </select>
                </div>

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
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Received Quantity</label>
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  defaultValue="10"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Notes / Consignment Reference</label>
                <input
                  name="notes"
                  placeholder="e.g. Purchase order PO-9912, inspected and sealed"
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
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Create Receipt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
