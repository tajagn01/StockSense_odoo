"use client";

import { useState } from "react";
import { Plus, Warehouse, MapPin, X, Building2 } from "lucide-react";
import { createWarehouseAction, createLocationAction } from "@/app/actions/warehouseActions";

interface WarehousesClientViewProps {
  warehouses: any[];
}

export function WarehousesClientView({ warehouses }: WarehousesClientViewProps) {
  const [isWhModalOpen, setIsWhModalOpen] = useState(false);
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [selectedWhId, setSelectedWhId] = useState(warehouses[0]?.id || "");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleCreateWarehouse(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await createWarehouseAction(formData);

    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || "Failed to create warehouse.");
    } else {
      setIsWhModalOpen(false);
    }
  }

  async function handleCreateLocation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await createLocationAction(formData);

    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || "Failed to add location.");
    } else {
      setIsLocModalOpen(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2.5">
        <button
          onClick={() => {
            setErrorMessage(null);
            setIsLocModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#FFFFFF] hover:bg-[#F2F2ED] text-[#464B71] border border-[rgba(70,75,113,0.15)] shadow-sm transition"
        >
          <MapPin className="h-4 w-4 text-[#168FB3]" />
          <span>Add Location / Bin</span>
        </button>

        <button
          onClick={() => {
            setErrorMessage(null);
            setIsWhModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#168FB3] hover:bg-[#127492] text-white shadow-sm transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Warehouse</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {errorMessage}
        </div>
      )}

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {warehouses.map((wh) => (
          <div
            key={wh.id}
            className="rounded-xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-[#F2F2ED] text-[#464B71]">
                    <Warehouse className="h-5 w-5 text-[#168FB3]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#464B71]">{wh.name}</h2>
                    <span className="text-[11px] font-mono text-[#646981]">Code: {wh.code}</span>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#73D0C3]/20 text-[#464B71] border border-[#73D0C3]/40">
                  Active
                </span>
              </div>

              {wh.address && (
                <p className="text-xs text-[#646981] mb-4 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#646981]" />
                  {wh.address}
                </p>
              )}

              {/* Locations List */}
              <div className="space-y-2 mt-4 pt-4 border-t border-[rgba(70,75,113,0.08)]">
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#646981] mb-2">
                  <span>Assigned Locations ({wh.locations.length})</span>
                </div>

                {wh.locations.length === 0 ? (
                  <div className="text-xs text-[#646981] py-2">No storage locations assigned yet.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {wh.locations.map((loc: any) => (
                      <div
                        key={loc.id}
                        className="p-2.5 rounded-lg bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)] flex items-center justify-between"
                      >
                        <div className="truncate">
                          <div className="text-xs font-semibold text-[#464B71] truncate">{loc.name}</div>
                          <div className="text-[10px] text-[#646981] font-mono">{loc.code}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[rgba(70,75,113,0.08)] flex items-center justify-between text-xs text-[#646981]">
              <span>{wh.inventory?.length || 0} registered SKU stock balances</span>
              <button
                onClick={() => {
                  setSelectedWhId(wh.id);
                  setIsLocModalOpen(true);
                }}
                className="text-[#168FB3] hover:underline font-semibold"
              >
                + Add Bin
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Warehouse Modal */}
      {isWhModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-xl bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] shadow-xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(70,75,113,0.10)]">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#168FB3]" />
                <h3 className="text-base font-bold text-[#464B71]">Create Warehouse Facility</h3>
              </div>
              <button onClick={() => setIsWhModalOpen(false)} className="text-[#646981] hover:text-[#464B71]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWarehouse} className="mt-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#464B71]">Warehouse Name</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. West Coast Distribution Depot"
                  className="w-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-lg px-3 py-2 text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#464B71]">Warehouse Code</label>
                <input
                  name="code"
                  required
                  placeholder="e.g. WH-WEST"
                  className="w-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-lg px-3 py-2 text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3] uppercase font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#464B71]">Physical Address</label>
                <input
                  name="address"
                  placeholder="Street address, city, state"
                  className="w-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-lg px-3 py-2 text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[rgba(70,75,113,0.10)]">
                <button
                  type="button"
                  onClick={() => setIsWhModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#646981] hover:text-[#464B71] hover:bg-[#F2F2ED] rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#168FB3] hover:bg-[#127492] text-white transition disabled:opacity-50"
                >
                  Save Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {isLocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-xl bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] shadow-xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(70,75,113,0.10)]">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#168FB3]" />
                <h3 className="text-base font-bold text-[#464B71]">Add Location / Storage Bin</h3>
              </div>
              <button onClick={() => setIsLocModalOpen(false)} className="text-[#646981] hover:text-[#464B71]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLocation} className="mt-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#464B71]">Parent Warehouse</label>
                <select
                  name="warehouseId"
                  value={selectedWhId}
                  onChange={(e) => setSelectedWhId(e.target.value)}
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

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#464B71]">Location Name</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Rack C — Fast Moving Goods"
                  className="w-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-lg px-3 py-2 text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#464B71]">Location Code</label>
                <input
                  name="code"
                  required
                  placeholder="e.g. LOC-RACK-C1"
                  className="w-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-lg px-3 py-2 text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3] uppercase font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[rgba(70,75,113,0.10)]">
                <button
                  type="button"
                  onClick={() => setIsLocModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#646981] hover:text-[#464B71] hover:bg-[#F2F2ED] rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#168FB3] hover:bg-[#127492] text-white transition disabled:opacity-50"
                >
                  Add Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
