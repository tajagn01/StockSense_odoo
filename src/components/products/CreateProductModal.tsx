"use client";

import { useState } from "react";
import { Plus, X, Loader2, PackagePlus } from "lucide-react";
import { createProductAction } from "@/app/actions/productActions";

interface CreateProductModalProps {
  categories: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string; code: string; warehouse: { name: string } }>;
}

export function CreateProductModal({ categories, locations }: CreateProductModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await createProductAction(formData);

    setIsLoading(false);
    if (!result.success) {
      setErrorMessage(result.error || "An error occurred.");
    } else {
      setIsOpen(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#168FB3] hover:bg-[#127492] text-white shadow-sm transition"
      >
        <Plus className="h-4 w-4" />
        <span>Add Product</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-xl bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] shadow-xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(70,75,113,0.10)]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#F2F2ED] text-[#464B71]">
                  <PackagePlus className="h-4 w-4 text-[#168FB3]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#464B71]">Create New Product</h3>
                  <p className="text-xs text-[#646981]">Add a registered SKU into the inventory catalog</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#646981] hover:text-[#464B71] p-1 rounded-lg hover:bg-[#F2F2ED]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#464B71]">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="name"
                    required
                    placeholder="e.g. Steel Rods 20mm"
                    className="w-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-lg px-3 py-2 text-xs text-[#464B71] placeholder:text-[#646981]/50 focus:outline-none focus:border-[#168FB3]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#464B71]">
                    SKU Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="sku"
                    required
                    placeholder="e.g. STL-ROD-020"
                    className="w-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-lg px-3 py-2 text-xs text-[#464B71] placeholder:text-[#646981]/50 focus:outline-none focus:border-[#168FB3] uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#464B71]">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="categoryId"
                    required
                    className="w-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-lg px-3 py-2 text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3] cursor-pointer"
                  >
                    <option value="">Select category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#464B71]">
                    Unit of Measure (UOM) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="uom"
                    required
                    placeholder="kg, pcs, meters, boxes"
                    className="w-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-lg px-3 py-2 text-xs text-[#464B71] placeholder:text-[#646981]/50 focus:outline-none focus:border-[#168FB3]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#464B71]">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Technical specifications, supplier reference, storage guidance..."
                  className="w-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-lg px-3 py-2 text-xs text-[#464B71] placeholder:text-[#646981]/50 focus:outline-none focus:border-[#168FB3]"
                />
              </div>

              <div className="p-3.5 rounded-lg bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.10)] space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#464B71]">
                  Initial Stock Setup
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] text-[#646981] font-medium">Warehouse Location</label>
                    <select
                      name="locationId"
                      className="w-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-lg px-2.5 py-1.5 text-xs text-[#464B71] focus:outline-none"
                    >
                      <option value="">Select warehouse location...</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.warehouse.name} — {loc.name} ({loc.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#646981] font-medium">Initial Quantity</label>
                    <input
                      name="initialQuantity"
                      type="number"
                      min="0"
                      defaultValue="0"
                      className="w-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-lg px-2.5 py-1.5 text-xs text-[#464B71] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#646981] font-medium">Low-Stock Reorder Threshold</label>
                  <input
                    name="reorderLevel"
                    type="number"
                    min="1"
                    defaultValue="20"
                    className="w-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-lg px-2.5 py-1.5 text-xs text-[#464B71] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[rgba(70,75,113,0.10)]">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-[#646981] hover:text-[#464B71] hover:bg-[#F2F2ED] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#168FB3] hover:bg-[#127492] text-white transition disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
