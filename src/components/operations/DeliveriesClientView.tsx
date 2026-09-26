"use client";

import { useState } from "react";
import { Plus, Check, Loader2, X, ArrowUpFromLine, CheckCircle2, Clock } from "lucide-react";
import { createDeliveryAction, validateDeliveryAction } from "@/app/actions/deliveryActions";

interface DeliveriesClientViewProps {
  deliveries: any[];
  customers: Array<{ id: string; name: string }>;
  warehouses: Array<{ id: string; name: string; code: string }>;
  locations: Array<{ id: string; name: string; code: string; warehouseId: string }>;
  products: Array<{ id: string; name: string; sku: string; uom: string }>;
}

export function DeliveriesClientView({
  deliveries,
  customers,
  warehouses,
  locations,
  products,
}: DeliveriesClientViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(warehouses[0]?.id || "");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredLocations = locations.filter((l) => l.warehouseId === selectedWarehouse);

  const displayDeliveries = deliveries.filter((d) => {
    if (statusFilter === "ALL") return true;
    return d.status === statusFilter;
  });

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await createDeliveryAction(formData);

    setIsSubmitting(false);
    if (!res.success) {
      setErrorMessage(res.error || "Failed to create delivery order.");
    } else {
      setIsModalOpen(false);
    }
  }

  async function handleValidate(id: string) {
    setValidatingId(id);
    const res = await validateDeliveryAction(id);
    setValidatingId(null);
    if (!res.success) {
      alert(res.error || "Failed to validate delivery order.");
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter and Create Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="READY">Ready for Dispatch</option>
            <option value="PICKING">Picking / Packing</option>
            <option value="DONE">Completed & Dispatched</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30 transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Delivery Order</span>
        </button>
      </div>

      {/* Deliveries Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Delivery Order #</th>
                <th className="py-3.5 px-4 font-semibold">Customer</th>
                <th className="py-3.5 px-4 font-semibold">Origin Warehouse</th>
                <th className="py-3.5 px-4 font-semibold">Items & Qty</th>
                <th className="py-3.5 px-4 font-semibold">Created Date</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Dispatch Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No delivery orders under this status.
                  </td>
                </tr>
              ) : (
                displayDeliveries.map((delivery) => {
                  const isDone = delivery.status === "DONE";
                  return (
                    <tr key={delivery.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-white text-xs">{delivery.deliveryNo}</span>
                        {delivery.notes && (
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">{delivery.notes}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        {delivery.customer?.name || "Direct Customer"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {delivery.warehouse.name} ({delivery.warehouse.code})
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {delivery.items.map((item: any, i: number) => (
                            <div key={i} className="text-[11px] text-slate-300">
                              <span className="font-semibold text-rose-300">-{item.quantity}</span> {item.product.uom}{" "}
                              <span className="text-slate-400">({item.product.name})</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(delivery.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" />
                            Dispatched
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="h-3 w-3" />
                            {delivery.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isDone ? (
                          <span className="text-[11px] text-slate-400 font-mono">Dispatched ✓</span>
                        ) : (
                          <button
                            onClick={() => handleValidate(delivery.id)}
                            disabled={validatingId === delivery.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50"
                          >
                            {validatingId === delivery.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                            <span>Validate & Ship</span>
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

      {/* Create Delivery Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ArrowUpFromLine className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create Outward Delivery Order</h3>
                  <p className="text-xs text-slate-400">Dispatch stock to customer destination</p>
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
                  <label className="text-[11px] font-medium text-slate-300">Customer</label>
                  <select
                    name="customerId"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">Source Warehouse</label>
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
                  <label className="text-[11px] font-medium text-slate-300">Pick Location</label>
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
                <label className="text-[11px] font-medium text-slate-300">Delivery Quantity</label>
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  defaultValue="5"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Shipping Notes / Order Ref</label>
                <input
                  name="notes"
                  placeholder="e.g. Sales order SO-1024, freight priority"
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
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Create Delivery</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
