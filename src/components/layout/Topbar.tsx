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
} from "lucide-react";
import Link from "next/link";

interface TopbarProps {
  warehouses?: Array<{ id: string; name: string; code: string }>;
}

export function Topbar({ warehouses = [] }: TopbarProps) {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("ALL");
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  return (
    <header className="h-16 border-b border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#646981]" />
          <input
            type="text"
            placeholder="Search SKU, product, receipt, delivery #..."
            className="w-full bg-[#F2F2ED] border border-[rgba(70,75,113,0.12)] rounded-lg pl-9 pr-4 py-1.5 text-xs text-[#464B71] placeholder:text-[#646981] focus:outline-none focus:border-[#168FB3] focus:ring-1 focus:ring-[#168FB3] transition"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Warehouse Selector */}
        <div className="relative flex items-center">
          <div className="flex items-center gap-2 bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] rounded-lg px-3 py-1.5 text-xs text-[#464B71]">
            <Warehouse className="h-3.5 w-3.5 text-[#168FB3]" />
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="bg-transparent text-[#464B71] focus:outline-none text-xs cursor-pointer font-medium"
            >
              <option value="ALL">All Warehouses</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
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
            className="flex items-center gap-1.5 bg-[#168FB3] hover:bg-[#127492] text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Operation</span>
            <ChevronDown className="h-3 w-3 text-white/80" />
          </button>

          {isQuickMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
              onMouseLeave={() => setIsQuickMenuOpen(false)}
            >
              <Link
                href="/operations/receipts"
                onClick={() => setIsQuickMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#464B71] hover:bg-[#F2F2ED] rounded-lg transition font-medium"
              >
                <ArrowDownToLine className="h-4 w-4 text-[#168FB3]" />
                <span>Receive Inward Stock</span>
              </Link>
              <Link
                href="/operations/deliveries"
                onClick={() => setIsQuickMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#464B71] hover:bg-[#F2F2ED] rounded-lg transition font-medium"
              >
                <ArrowUpFromLine className="h-4 w-4 text-[#168FB3]" />
                <span>Create Delivery Order</span>
              </Link>
              <Link
                href="/operations/transfers"
                onClick={() => setIsQuickMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#464B71] hover:bg-[#F2F2ED] rounded-lg transition font-medium"
              >
                <ArrowLeftRight className="h-4 w-4 text-[#168FB3]" />
                <span>Internal Stock Transfer</span>
              </Link>
              <Link
                href="/operations/adjustments"
                onClick={() => setIsQuickMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#464B71] hover:bg-[#F2F2ED] rounded-lg transition font-medium"
              >
                <SlidersHorizontal className="h-4 w-4 text-[#168FB3]" />
                <span>Inventory Adjustment</span>
              </Link>
            </div>
          )}
        </div>

        {/* Notifications */}
        <Link
          href="/dashboard"
          className="relative p-2 rounded-lg bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] text-[#646981] hover:text-[#464B71] hover:bg-[#F2F2ED] transition"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#168FB3] ring-2 ring-white" />
        </Link>
      </div>
    </header>
  );
}
