"use client";

import { useState } from "react";
import {
  Plus,
  Check,
  Loader2,
  X,
  ArrowUpFromLine,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  ClipboardList,
  AlertCircle,
} from "lucide-react";
import {
  createDeliveryAction,
  startPickingDeliveryAction,
  packDeliveryAction,
  validateDeliveryAction,
} from "@/app/actions/deliveryActions";

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
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(warehouses[0]?.id || "");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmDelivery, setConfirmDelivery] = useState<any | null>(null);

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

  async function handleStartPicking(id: string) {
    setActiveActionId(id);
    const res = await startPickingDeliveryAction(id);
    setActiveActionId(null);
    if (!res.success) {
      alert(res.error || "Failed to start picking.");
    }
  }

  async function handlePack(id: string) {
    setActiveActionId(id);
    const res = await packDeliveryAction(id);
    setActiveActionId(null);
    if (!res.success) {
      alert(res.error || "Failed to pack delivery items.");
    }
  }

  async function handleConfirmShip() {
    if (!confirmDelivery) return;
    setActiveActionId(confirmDelivery.id);
    const res = await validateDeliveryAction(confirmDelivery.id);
    setActiveActionId(null);
    setConfirmDelivery(null);

    if (!res.success) {
      alert(res.error || "Failed to validate delivery order.");
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DONE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#73D0C3]/25 text-[#464B71] border border-[#73D0C3]/40">
            <CheckCircle2 className="h-3 w-3 text-[#168FB3]" />
            Dispatched & Done
          </span>
        );
      case "PACKED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#73D0C3]/20 text-[#168FB3] border border-[#73D0C3]/40">
            <PackageCheck className="h-3 w-3" />
            Packed (Ready to Ship)
          </span>
        );
      case "PICKING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#168FB3]/10 text-[#168FB3] border border-[#168FB3]/20">
            <ClipboardList className="h-3 w-3" />
            Picking in Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F2F2ED] text-[#464B71] border border-[rgba(70,75,113,0.15)]">
            <Clock className="h-3 w-3" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF]">
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#646981] font-medium">Filter by Stage:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] rounded-lg px-3 py-1.5 text-xs text-[#464B71] focus:outline-none cursor-pointer font-medium"
          >
            <option value="ALL">All Stages</option>
            <option value="READY">01. Ready</option>
            <option value="PICKING">02. Picking</option>
            <option value="PACKED">03. Packed</option>
            <option value="DONE">04. Dispatched (Done)</option>
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#168FB3] hover:bg-[#127492] text-white shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Delivery Order</span>
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F2F2ED] text-[11px] uppercase tracking-wider text-[#646981] border-b border-[rgba(70,75,113,0.10)]">
              <tr>
                <th className="py-3 px-4 font-semibold">Delivery Order #</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Origin Facility</th>
                <th className="py-3 px-4 font-semibold">Items (Ordered / Packed)</th>
                <th className="py-3 px-4 font-semibold">Created Date</th>
                <th className="py-3 px-4 font-semibold">Workflow Stage</th>
                <th className="py-3 px-4 font-semibold text-right">Operational Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(70,75,113,0.08)]">
              {displayDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-[#646981]">
                      <Truck className="h-8 w-8 text-[#646981]/50 mb-2" />
                      <p className="font-semibold text-sm text-[#464B71]">No delivery orders found</p>
                      <p className="text-xs text-[#646981] mt-0.5">Create an order to dispatch products to customers.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayDeliveries.map((delivery) => {
                  const isDone = delivery.status === "DONE";
                  const isReady = delivery.status === "READY" || delivery.status === "DRAFT";
                  const isPicking = delivery.status === "PICKING";
                  const isPacked = delivery.status === "PACKED";

                  return (
                    <tr key={delivery.id} className="hover:bg-[#F2F2ED]/60 transition">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[#464B71] text-xs">{delivery.deliveryNo}</span>
                        {delivery.notes && (
                          <div className="text-[10px] text-[#646981] mt-0.5 truncate max-w-xs">{delivery.notes}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#464B71]">
                        {delivery.customer?.name || "Direct Customer"}
                      </td>
                      <td className="py-3 px-4 text-[#646981]">
                        {delivery.warehouse.name} ({delivery.warehouse.code})
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {delivery.items.map((item: any, i: number) => (
                            <div key={i} className="text-[11px] text-[#464B71]">
                              <span className="font-bold text-[#464B71]">-{item.quantity}</span> {item.product.uom}{" "}
                              <span className="text-[#646981]">({item.product.name})</span>
                              {(isPicking || isPacked) && (
                                <span className="ml-1 text-[10px] text-[#168FB3] font-mono">
                                  [Pk:{item.pickedQuantity} / Pk:{item.packedQuantity}]
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td suppressHydrationWarning className="py-3 px-4 text-[#646981]">
                        {new Date(delivery.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(delivery.status)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isDone && (
                          <span className="text-[11px] text-[#73D0C3] font-mono font-bold bg-[#464B71] px-2 py-0.5 rounded">
                            Dispatched ✓
                          </span>
                        )}

                        {isReady && (
                          <button
                            onClick={() => handleStartPicking(delivery.id)}
                            disabled={activeActionId === delivery.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#464B71] hover:bg-[#383c5a] text-white transition disabled:opacity-50"
                          >
                            {activeActionId === delivery.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <ClipboardList className="h-3 w-3 text-[#73D0C3]" />
                            )}
                            <span>Start Picking</span>
                          </button>
                        )}

                        {isPicking && (
                          <button
                            onClick={() => handlePack(delivery.id)}
                            disabled={activeActionId === delivery.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#168FB3] hover:bg-[#127492] text-white transition disabled:opacity-50"
                          >
                            {activeActionId === delivery.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <PackageCheck className="h-3 w-3" />
                            )}
                            <span>Pack Items</span>
                          </button>
                        )}

                        {isPacked && (
                          <button
                            onClick={() => setConfirmDelivery(delivery)}
                            disabled={activeActionId === delivery.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#168FB3] hover:bg-[#127492] text-white transition disabled:opacity-50 shadow-sm"
                          >
                            <Check className="h-3 w-3" />
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

      {/* Confirmation Dialog before Final Ship */}
      {confirmDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-[#168FB3]/10 text-[#168FB3]">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#464B71]">Confirm Outward Dispatch</h3>
                <p className="text-xs text-[#646981]">Delivery Order: {confirmDelivery.deliveryNo}</p>
              </div>
            </div>

            <p className="text-xs text-[#646981] leading-relaxed mb-4">
              Validating and shipping this delivery will decrement physical stock from{" "}
              <strong className="text-[#464B71]">{confirmDelivery.warehouse.name}</strong>, create an immutable Stock Ledger entry, and finalize the shipment trail.
            </p>

            <div className="p-3 bg-[#F2F2ED]/60 rounded-xl border border-[rgba(70,75,113,0.08)] mb-6 text-xs space-y-1">
              {confirmDelivery.items.map((it: any, idx: number) => (
                <div key={idx} className="flex justify-between font-mono">
                  <span className="text-[#464B71]">{it.product.name}:</span>
                  <span className="font-bold text-[#168FB3]">-{it.quantity} {it.product.uom}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelivery(null)}
                className="px-4 py-2 text-xs font-semibold text-[#646981] hover:bg-[#F2F2ED] rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmShip}
                disabled={activeActionId === confirmDelivery.id}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#168FB3] hover:bg-[#127492] text-white rounded-xl transition shadow-sm"
              >
                {activeActionId === confirmDelivery.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Validate & Ship</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Delivery Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] shadow-xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(70,75,113,0.10)]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#F2F2ED] text-[#464B71]">
                  <ArrowUpFromLine className="h-4 w-4 text-[#168FB3]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#464B71]">Create Outward Delivery Order</h3>
                  <p className="text-xs text-[#646981]">Dispatch stock to customer destination</p>
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
                  <label className="text-[11px] font-semibold text-[#464B71]">Customer</label>
                  <select
                    name="customerId"
                    required
                    className="w-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-lg px-3 py-2 text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3]"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#464B71]">Source Facility</label>
                  <select
                    name="warehouseId"
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    required
                    className="w-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-lg px-3 py-2 text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3]"
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
                  <label className="text-[11px] font-semibold text-[#464B71]">Pick Location</label>
                  <select
                    name="locationId"
                    required
                    className="w-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-lg px-3 py-2 text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3]"
                  >
                    {filteredLocations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.code})
                      </option>
                    ))}
                  </select>
                </div>

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
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#464B71]">Delivery Quantity</label>
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  defaultValue="5"
                  required
                  className="w-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-lg px-3 py-2 text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#464B71]">Shipping Notes / Sales Order Ref</label>
                <input
                  name="notes"
                  placeholder="e.g. Sales order SO-1024, freight priority"
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
