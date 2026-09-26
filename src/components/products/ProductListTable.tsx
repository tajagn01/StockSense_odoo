"use client";

import { useState } from "react";
import { Search, Filter, AlertTriangle, CheckCircle2, XCircle, ArrowUpDown, PackageOpen } from "lucide-react";
import Link from "next/link";

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  uom: string;
  description: string | null;
  category: { id: string; name: string };
  inventory: Array<{
    quantity: number;
    location: { name: string; code: string };
    warehouse: { name: string; code: string };
  }>;
  reorderRules: Array<{ reorderLevel: number; reorderQuantity: number }>;
}

export function ProductListTable({ products }: { products: ProductItem[] }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [stockFilter, setStockFilter] = useState<"ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK">("ALL");

  const categories = Array.from(new Set(products.map((p) => p.category.name)));

  const filteredProducts = products.filter((p) => {
    const totalQty = p.inventory.reduce((sum, item) => sum + item.quantity, 0);
    const reorderLevel = p.reorderRules[0]?.reorderLevel ?? 20;

    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === "ALL" || p.category.name === selectedCategory;

    let matchesStock = true;
    if (stockFilter === "IN_STOCK") matchesStock = totalQty > reorderLevel;
    if (stockFilter === "LOW_STOCK") matchesStock = totalQty > 0 && totalQty <= reorderLevel;
    if (stockFilter === "OUT_OF_STOCK") matchesStock = totalQty === 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF]">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#646981]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name or SKU..."
            className="w-full bg-[#F2F2ED] border border-[rgba(70,75,113,0.12)] rounded-lg pl-9 pr-4 py-2 text-xs text-[#464B71] placeholder:text-[#646981] focus:outline-none focus:border-[#168FB3]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] rounded-lg px-3 py-2 text-xs text-[#464B71] focus:outline-none cursor-pointer font-medium"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] rounded-lg px-3 py-2 text-xs text-[#464B71] focus:outline-none cursor-pointer font-medium"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="IN_STOCK">Normal Stock</option>
            <option value="LOW_STOCK">Low Stock Alert</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F2F2ED] text-[11px] uppercase tracking-wider text-[#646981] border-b border-[rgba(70,75,113,0.10)]">
              <tr>
                <th className="py-3 px-4 font-semibold">Product Name & SKU</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">UOM</th>
                <th className="py-3 px-4 font-semibold">Available Stock</th>
                <th className="py-3 px-4 font-semibold">Warehouse / Location</th>
                <th className="py-3 px-4 font-semibold">Reorder Threshold</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(70,75,113,0.08)]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-[#646981]">
                      <PackageOpen className="h-8 w-8 text-[#646981]/50 mb-2" />
                      <p className="font-semibold text-sm text-[#464B71]">No products found</p>
                      <p className="text-xs text-[#646981] mt-0.5">Try adjusting your filters or search terms.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const totalStock = product.inventory.reduce((sum, item) => sum + item.quantity, 0);
                  const reorderLevel = product.reorderRules[0]?.reorderLevel ?? 20;

                  let statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#73D0C3]/20 text-[#464B71] border border-[#73D0C3]/40">
                      <CheckCircle2 className="h-3 w-3 text-[#168FB3]" />
                      In Stock
                    </span>
                  );

                  if (totalStock === 0) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="h-3 w-3" />
                        Out of Stock
                      </span>
                    );
                  } else if (totalStock <= reorderLevel) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="h-3 w-3" />
                        Low Stock
                      </span>
                    );
                  }

                  return (
                    <tr key={product.id} className="hover:bg-[#F2F2ED]/60 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#464B71]">{product.name}</div>
                        <div className="text-[11px] font-mono text-[#646981]">{product.sku}</div>
                      </td>
                      <td className="py-3 px-4 text-[#646981]">
                        <span className="px-2 py-0.5 rounded bg-[#F2F2ED] text-[11px] text-[#464B71] border border-[rgba(70,75,113,0.08)]">
                          {product.category.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#464B71] font-mono">{product.uom}</td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-bold text-[#464B71]">{totalStock}</span>{" "}
                        <span className="text-[10px] text-[#646981]">{product.uom}</span>
                      </td>
                      <td className="py-3 px-4 text-[#646981]">
                        {product.inventory.length === 0 ? (
                          <span className="text-[#646981]/60">Unassigned</span>
                        ) : (
                          <div className="space-y-0.5">
                            {product.inventory.map((inv, i) => (
                              <div key={i} className="text-[11px] text-[#464B71]">
                                {inv.warehouse.code} / {inv.location.name}:{" "}
                                <span className="font-bold">{inv.quantity}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#646981] font-mono">
                        {reorderLevel} {product.uom}
                      </td>
                      <td className="py-3 px-4">{statusBadge}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href="/operations/receipts"
                            className="px-2.5 py-1 text-[11px] font-semibold rounded bg-[#168FB3]/10 text-[#168FB3] hover:bg-[#168FB3]/20 transition"
                          >
                            Receive
                          </Link>
                          <Link
                            href="/operations/adjustments"
                            className="px-2.5 py-1 text-[11px] font-medium rounded bg-[#F2F2ED] text-[#464B71] hover:bg-[#F2F2ED]/80 border border-[rgba(70,75,113,0.12)] transition"
                          >
                            Count
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
