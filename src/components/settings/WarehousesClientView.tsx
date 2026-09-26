"use client";

import { useState } from "react";
import { Plus, Warehouse, MapPin, X, Loader2, Building2 } from "lucide-react";
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
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => {
            setErrorMessage(null);
            setIsLocModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          <MapPin className="h-4 w-4 text-indigo-400" />
          <span>Add Location / Bin</span>
        </button>

        <button
          onClick={() => {
            setErrorMessage(null);
            setIsWhModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Warehouse</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
          {errorMessage}
        </div>
      )}

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {warehouses.map((wh) => (
          <div
            key={wh.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Warehouse className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">{wh.name}</h2>
                    <span className="text-[11px] font-mono text-indigo-400">Code: {wh.code}</span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              </div>

              {wh.address && (
                <p className="text-xs text-slate-400 mb-4 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {wh.address}
                </p>
              )}

              {/* Locations List */}
              <div className="space-y-2 mt-4 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  <span>Assigned Locations ({wh.locations.length})</span>
                </div>

                {wh.locations.length === 0 ? (
                  <div className="text-xs text-slate-400 py-2">No locations defined in this facility yet.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {wh.locations.map((loc: any) => (
                      <div
                        key={loc.id}
                        className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="truncate">
                          <div className="text-xs font-medium text-white truncate">{loc.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{loc.code}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <span>{wh.inventory?.length || 0} active SKU stock records</span>
              <button
                onClick={() => {
                  setSelectedWhId(wh.id);
                  setIsLocModalOpen(true);
                }}
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                + Add Bin
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Warehouse Modal */}
      {isWhModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Create Warehouse Facility</h3>
              </div>
              <button onClick={() => setIsWhModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWarehouse} className="mt-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Warehouse Name</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. West Coast Distribution"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Warehouse Code</label>
                <input
                  name="code"
                  required
                  placeholder="e.g. WH-WEST"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none uppercase font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Physical Address</label>
                <input
                  name="address"
                  placeholder="Street address, city, state"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsWhModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Add Location / Storage Bin</h3>
              </div>
              <button onClick={() => setIsLocModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLocation} className="mt-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Parent Warehouse</label>
                <select
                  name="warehouseId"
                  value={selectedWhId}
                  onChange={(e) => setSelectedWhId(e.target.value)}
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

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Location Name</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Rack C — Fast Moving Goods"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Location Code</label>
                <input
                  name="code"
                  required
                  placeholder="e.g. LOC-RACK-C1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none uppercase font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLocModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50"
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
