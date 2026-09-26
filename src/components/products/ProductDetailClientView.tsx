"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Boxes,
  Warehouse,
  History,
  Edit3,
  Barcode,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
} from "lucide-react";
import { updateProductAction } from "@/app/actions/productActions";

interface ProductDetailClientViewProps {
  product: any;
  categories: any[];
  warehouses: any[];
}

export function ProductDetailClientView({
  product,
  categories,
  warehouses,
}: ProductDetailClientViewProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalQuantity = product.inventory.reduce(
    (acc: number, item: any) => acc + item.quantity,
    0
  );

  const reorderRule = product.reorderRules[0] || {
    reorderLevel: 20,
    reorderQuantity: 50,
  };

  const getStockStatus = () => {
    if (totalQuantity === 0) {
      return {
        label: "Out of Stock",
        color: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
      };
    }
    if (totalQuantity <= reorderRule.reorderLevel) {
      return {
        label: "Low Stock Alert",
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: AlertTriangle,
      };
    }
    return {
      label: "Healthy Stock",
      color: "bg-[#73D0C3]/20 text-[#464B71] border-[#73D0C3]/40",
      icon: CheckCircle2,
    };
  };

  const status = getStockStatus();
  const StatusIcon = status.icon;

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await updateProductAction(product.id, formData);

    if (res.success) {
      setIsEditModalOpen(false);
      window.location.reload();
    } else {
      setError(res.error || "Failed to update product.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs text-[#646981] hover:text-[#464B71] font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Product Catalog
        </Link>
      </div>

      {/* Product Summary Header Card */}
      <div className="bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[rgba(70,75,113,0.10)]">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-[#F2F2ED] border border-[rgba(70,75,113,0.12)] flex items-center justify-center shrink-0">
              <Boxes className="h-7 w-7 text-[#168FB3]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-[#464B71]">{product.name}</h1>
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${status.color}`}>
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[#646981]">
                <span className="font-mono bg-[#F2F2ED] px-2 py-0.5 rounded border border-[rgba(70,75,113,0.12)] text-[#464B71] font-semibold">
                  SKU: {product.sku}
                </span>
                <span>Category: <strong className="text-[#464B71]">{product.category.name}</strong></span>
                <span>Unit: <strong className="text-[#464B71]">{product.uom}</strong></span>
                {product.barcode && (
                  <span className="flex items-center gap-1 font-mono">
                    <Barcode className="h-3.5 w-3.5" />
                    {product.barcode}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#168FB3] hover:bg-[#127492] text-white text-xs font-semibold rounded-xl transition shadow-sm"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Product
          </button>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-3.5 rounded-xl bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)]">
            <div className="text-[11px] font-semibold text-[#646981]">Current Total Stock</div>
            <div className="text-2xl font-bold text-[#464B71] mt-1">
              {totalQuantity}{" "}
              <span className="text-xs font-normal text-[#646981]">{product.uom}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)]">
            <div className="text-[11px] font-semibold text-[#646981]">Reorder Trigger Level</div>
            <div className="text-2xl font-bold text-[#464B71] mt-1">
              {reorderRule.reorderLevel}{" "}
              <span className="text-xs font-normal text-[#646981]">{product.uom}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)]">
            <div className="text-[11px] font-semibold text-[#646981]">Reorder Quantity Target</div>
            <div className="text-2xl font-bold text-[#168FB3] mt-1">
              {reorderRule.reorderQuantity}{" "}
              <span className="text-xs font-normal text-[#646981]">{product.uom}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)]">
            <div className="text-[11px] font-semibold text-[#646981]">Allocated Locations</div>
            <div className="text-2xl font-bold text-[#464B71] mt-1">
              {product.inventory.length}
            </div>
          </div>
        </div>

        {product.description && (
          <div className="mt-4 pt-4 border-t border-[rgba(70,75,113,0.08)] text-xs text-[#646981]">
            <strong className="text-[#464B71]">Description:</strong> {product.description}
          </div>
        )}
      </div>

      {/* Stock by Warehouse & Location */}
      <div className="bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[rgba(70,75,113,0.10)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Warehouse className="h-4 w-4 text-[#168FB3]" />
            <h2 className="text-sm font-bold text-[#464B71]">Stock Distribution by Bin Location</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[rgba(70,75,113,0.10)] bg-[#F2F2ED]/60 text-[#464B71] font-semibold">
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4">Warehouse Code</th>
                <th className="py-3 px-4">Bin Location</th>
                <th className="py-3 px-4">Location Code</th>
                <th className="py-3 px-4 text-right">Available Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(70,75,113,0.06)]">
              {product.inventory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-[#646981]">
                    No inventory records registered for this product yet.
                  </td>
                </tr>
              ) : (
                product.inventory.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-[#F2F2ED]/50 transition">
                    <td className="py-3 px-4 font-semibold text-[#464B71]">{inv.warehouse.name}</td>
                    <td className="py-3 px-4 font-mono text-[#646981]">{inv.warehouse.code}</td>
                    <td className="py-3 px-4 text-[#464B71]">{inv.location.name}</td>
                    <td className="py-3 px-4 font-mono text-[#168FB3]">{inv.location.code}</td>
                    <td className="py-3 px-4 text-right font-bold text-[#464B71]">
                      {inv.quantity} <span className="font-normal text-[#646981]">{product.uom}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement History (Filtered StockLedger for this Product) */}
      <div className="bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[rgba(70,75,113,0.10)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-[#168FB3]" />
            <h2 className="text-sm font-bold text-[#464B71]">Recent Movement History (Stock Ledger)</h2>
          </div>
          <Link
            href="/operations/move-history"
            className="text-xs text-[#168FB3] hover:underline font-medium"
          >
            View Full Ledger
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[rgba(70,75,113,0.10)] bg-[#F2F2ED]/60 text-[#464B71] font-semibold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">Before</th>
                <th className="py-3 px-4 text-right">Change</th>
                <th className="py-3 px-4 text-right">After</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(70,75,113,0.06)]">
              {product.ledger.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#646981]">
                    No stock movements recorded for this item.
                  </td>
                </tr>
              ) : (
                product.ledger.map((entry: any) => (
                  <tr key={entry.id} className="hover:bg-[#F2F2ED]/50 transition">
                    <td suppressHydrationWarning className="py-3 px-4 text-[#646981] whitespace-nowrap font-mono text-[11px]">
                      {new Date(entry.createdAt).toLocaleDateString()} {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[10px] font-bold">
                      <span className="px-2 py-0.5 rounded bg-[#F2F2ED] border border-[rgba(70,75,113,0.12)] text-[#464B71]">
                        {entry.movementType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#464B71] whitespace-nowrap">
                      {entry.location?.name || "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#646981]">{entry.beforeQuantity}</td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${entry.quantity >= 0 ? "text-[#168FB3]" : "text-[#464B71]"}`}>
                      {entry.quantity > 0 ? `+${entry.quantity}` : entry.quantity}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#464B71]">{entry.afterQuantity}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#168FB3] whitespace-nowrap">
                      {entry.referenceId || "—"}
                    </td>
                    <td className="py-3 px-4 text-[#646981] whitespace-nowrap">
                      {entry.user?.name || "System"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(70,75,113,0.10)] mb-4">
              <h2 className="text-base font-bold text-[#464B71]">Edit Product Details</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 text-[#646981] hover:text-[#464B71]">
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#464B71] mb-1">Product Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={product.name}
                  className="w-full px-3 py-2 bg-[#F2F2ED]/50 border border-[rgba(70,75,113,0.15)] rounded-xl text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#464B71] mb-1">Category</label>
                  <select
                    name="categoryId"
                    defaultValue={product.categoryId}
                    className="w-full px-3 py-2 bg-[#F2F2ED]/50 border border-[rgba(70,75,113,0.15)] rounded-xl text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#464B71] mb-1">Unit of Measure (UOM)</label>
                  <input
                    type="text"
                    name="uom"
                    required
                    defaultValue={product.uom}
                    className="w-full px-3 py-2 bg-[#F2F2ED]/50 border border-[rgba(70,75,113,0.15)] rounded-xl text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#464B71] mb-1">Reorder Level</label>
                  <input
                    type="number"
                    name="reorderLevel"
                    min="0"
                    defaultValue={reorderRule.reorderLevel}
                    className="w-full px-3 py-2 bg-[#F2F2ED]/50 border border-[rgba(70,75,113,0.15)] rounded-xl text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#464B71] mb-1">Reorder Target Qty</label>
                  <input
                    type="number"
                    name="reorderQuantity"
                    min="1"
                    defaultValue={reorderRule.reorderQuantity}
                    className="w-full px-3 py-2 bg-[#F2F2ED]/50 border border-[rgba(70,75,113,0.15)] rounded-xl text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#464B71] mb-1">Barcode / UPC</label>
                <input
                  type="text"
                  name="barcode"
                  defaultValue={product.barcode || ""}
                  placeholder="Optional barcode scan value"
                  className="w-full px-3 py-2 bg-[#F2F2ED]/50 border border-[rgba(70,75,113,0.15)] rounded-xl text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#464B71] mb-1">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={product.description || ""}
                  className="w-full px-3 py-2 bg-[#F2F2ED]/50 border border-[rgba(70,75,113,0.15)] rounded-xl text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-[rgba(70,75,113,0.15)] rounded-xl text-xs font-semibold text-[#646981] hover:bg-[#F2F2ED]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#168FB3] hover:bg-[#127492] text-white text-xs font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
