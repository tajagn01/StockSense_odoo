"use client";

import { useState } from "react";
import {
  Search,
  Warehouse,
  Bell,
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  ChevronDown,
  Database,
} from "lucide-react";
import Link from "next/link";

interface TopbarProps {
  warehouses?: Array<{ id: string; name: string; code: string }>;
}

export function Topbar({ warehouses = [] }: TopbarProps) {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("ALL");
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKU, product, receipt, delivery #..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Database Status indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
          <Database className="h-3.5 w-3.5" />
          <span>PostgreSQL Active</span>
        </div>

        {/* Warehouse Selector */}
        <div className="relative flex items-center">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300">
            <Warehouse className="h-3.5 w-3.5 text-indigo-400" />
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none text-xs cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">
                All Warehouses
              </option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id} className="bg-slate-900 text-slate-200">
                  {wh.name} ({wh.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="relative">
          <button
            onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm shadow-indigo-600/30 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Operation</span>
            <ChevronDown className="h-3 w-3 text-indigo-200" />
          </button>

          {isQuickMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              onMouseLeave={() => setIsQuickMenuOpen(false)}
            >
              <Link
                href="/operations/receipts"
                onClick={() => setIsQuickMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition"
              >
                <ArrowDownToLine className="h-4 w-4 text-cyan-400" />
                <span>Receive Inward Stock</span>
              </Link>
              <Link
                href="/operations/deliveries"
                onClick={() => setIsQuickMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition"
              >
                <ArrowUpFromLine className="h-4 w-4 text-emerald-400" />
                <span>Create Delivery Order</span>
              </Link>
              <Link
                href="/operations/transfers"
                onClick={() => setIsQuickMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition"
              >
                <ArrowLeftRight className="h-4 w-4 text-violet-400" />
                <span>Internal Stock Transfer</span>
              </Link>
              <Link
                href="/operations/adjustments"
                onClick={() => setIsQuickMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition"
              >
                <SlidersHorizontal className="h-4 w-4 text-amber-400" />
                <span>Inventory Adjustment</span>
              </Link>
            </div>
          )}
        </div>

        {/* Notifications */}
        <Link
          href="/dashboard"
          className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-slate-950" />
        </Link>
      </div>
    </header>
  );
}
