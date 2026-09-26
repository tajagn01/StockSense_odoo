"use client";

import { useState } from "react";
import { Search, Filter, Layers, AlertTriangle, CheckCircle2, XCircle, ArrowUpDown } from "lucide-react";
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

  // Extract unique categories
  const categories = Array.from(new Set(products.map((p) => p.category.name)));

  // Filter products
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/50">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name or SKU..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Stock Level filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="IN_STOCK">Normal Stock</option>
            <option value="LOW_STOCK">Low Stock Alert</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Product Name & Code</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Unit (UOM)</th>
                <th className="py-3.5 px-4 font-semibold">Total Stock</th>
                <th className="py-3.5 px-4 font-semibold">Warehouse / Location</th>
                <th className="py-3.5 px-4 font-semibold">Reorder Level</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No products matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const totalStock = product.inventory.reduce((sum, item) => sum + item.quantity, 0);
                  const reorderLevel = product.reorderRules[0]?.reorderLevel ?? 20;

                  let statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" />
                      In Stock
                    </span>
                  );

                  if (totalStock === 0) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <XCircle className="h-3 w-3" />
                        Out of Stock
                      </span>
                    );
                  } else if (totalStock <= reorderLevel) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <AlertTriangle className="h-3 w-3" />
                        Low Stock
                      </span>
                    );
                  }

                  return (
                    <tr key={product.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{product.name}</div>
                        <div className="text-[11px] font-mono text-indigo-400">{product.sku}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300 border border-slate-700">
                          {product.category.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono">{product.uom}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-bold text-white">{totalStock}</span>{" "}
                        <span className="text-[10px] text-slate-400">{product.uom}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {product.inventory.length === 0 ? (
                          <span className="text-slate-500">Unassigned</span>
                        ) : (
                          <div className="space-y-0.5">
                            {product.inventory.map((inv, i) => (
                              <div key={i} className="text-[11px] text-slate-300">
                                {inv.warehouse.code} / {inv.location.name}:{" "}
                                <span className="font-semibold text-white">{inv.quantity}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        {reorderLevel} {product.uom}
                      </td>
                      <td className="py-3.5 px-4">{statusBadge}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href="/operations/receipts"
                            className="px-2.5 py-1 text-[11px] font-medium rounded bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 transition"
                          >
                            Receive
                          </Link>
                          <Link
                            href="/operations/adjustments"
                            className="px-2.5 py-1 text-[11px] font-medium rounded bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition"
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
