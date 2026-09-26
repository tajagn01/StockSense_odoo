"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "inventory" | "receipts" | "deliveries" | "transfers" | "adjustments"
  >("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "inventory", label: "Inventory", icon: Boxes },
    { id: "receipts", label: "Receipts", icon: ArrowDownToLine },
    { id: "deliveries", label: "Deliveries", icon: ArrowUpFromLine },
    { id: "transfers", label: "Transfers", icon: ArrowLeftRight },
    { id: "adjustments", label: "Adjustments", icon: SlidersHorizontal },
  ] as const;

  return (
    <section id="product-showcase" className="py-20 md:py-28 bg-[#FFFFFF] border-t border-[rgba(70,75,113,0.10)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-[#168FB3] font-bold">
            Interactive Product Showcase
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#464B71] tracking-tight">
            One system for the entire inventory operation.
          </h2>
          <p className="text-sm sm:text-base text-[#646981] leading-relaxed">
            Purpose-built interfaces designed for real warehouse speed. Explore how StockSense handles each stage of operational execution.
          </p>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 gap-2 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#464B71] text-white shadow-sm"
                    : "bg-[#F2F2ED]/70 text-[#646981] hover:bg-[#F2F2ED] hover:text-[#464B71]"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-[#73D0C3]" : "text-[#646981]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive View Container */}
        <div className="mt-8 rounded-2xl border border-[rgba(70,75,113,0.14)] bg-[#F2F2ED]/40 p-4 sm:p-8">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-mono font-bold text-[#168FB3] uppercase tracking-wider">
                  01 · Centralized Command
                </span>
                <h3 className="text-2xl font-bold text-[#464B71]">
                  Live operational pulse across facilities.
                </h3>
                <p className="text-xs sm:text-sm text-[#646981] leading-relaxed">
                  The dashboard synthesizes incoming receipts, packing queues, transfer allocations, and low-stock alerts into a single actionable surface.
                </p>
                <ul className="space-y-2 text-xs text-[#464B71] font-medium pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                    Real-time aggregated stock counters
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                    Automated low-stock threshold triggers
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                    Multi-facility valuation and balance reconciliation
                  </li>
                </ul>
                <div className="pt-2">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#168FB3] hover:underline"
                  >
                    Open live dashboard demo →
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 bg-[#FFFFFF] rounded-xl border border-[rgba(70,75,113,0.12)] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[rgba(70,75,113,0.06)] pb-3 text-xs">
                  <span className="font-bold text-[#464B71]">Facility Stock Distribution</span>
                  <span className="text-[10px] text-[#646981] font-mono">Updated real-time</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#F2F2ED]/50 border border-[rgba(70,75,113,0.06)] flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-[#464B71]">Central Logistics Hub (WH-CENTRAL)</div>
                      <div className="text-[10px] text-[#646981]">14 Active Storage Bins · 824 Units</div>
                    </div>
                    <span className="font-mono font-bold text-[#168FB3]">66% capacity</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F2F2ED]/50 border border-[rgba(70,75,113,0.06)] flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-[#464B71]">East Distribution Depot (WH-EAST)</div>
                      <div className="text-[10px] text-[#646981]">8 Active Storage Bins · 424 Units</div>
                    </div>
                    <span className="font-mono font-bold text-[#464B71]">34% capacity</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#168FB3]/10 border border-[#168FB3]/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-[#168FB3]" />
                    <span className="font-semibold text-[#464B71]">Safety Helmets (SKU-HLM-02) below threshold</span>
                  </div>
                  <span className="font-mono font-bold text-[#168FB3]">12 / 20 units</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-mono font-bold text-[#168FB3] uppercase tracking-wider">
                  02 · Catalog & Bin Allocation
                </span>
                <h3 className="text-2xl font-bold text-[#464B71]">
                  Granular SKU tracking across multi-bin locations.
                </h3>
                <p className="text-xs sm:text-sm text-[#646981] leading-relaxed">
                  Every product maintains SKU, unit of measure, category classification, barcode identification, and explicit location quantities.
                </p>
                <ul className="space-y-2 text-xs text-[#464B71] font-medium pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                    Unique compound key constraints (Product + Location)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                    Automated reorder point and minimum safety stock rules
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                    Strict non-negative database constraints
                  </li>
                </ul>
                <div className="pt-2">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#168FB3] hover:underline"
                  >
                    View product catalog →
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 bg-[#FFFFFF] rounded-xl border border-[rgba(70,75,113,0.12)] p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-[rgba(70,75,113,0.06)] pb-2.5 text-xs">
                  <span className="font-bold text-[#464B71]">Master Catalog Sample</span>
                  <span className="text-[10px] text-[#646981]">Filter: All Categories</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F2F2ED]/40 border border-[rgba(70,75,113,0.06)]">
                    <div>
                      <div className="font-semibold text-[#464B71]">Industrial Safety Gloves</div>
                      <div className="text-[10px] font-mono text-[#646981]">SKU-GLV-01 · Zone A-01 (Bin 4)</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-[#464B71]">240 Units</div>
                      <div className="text-[10px] text-[#73D0C3] font-semibold">In Stock</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F2F2ED]/40 border border-[rgba(70,75,113,0.06)]">
                    <div>
                      <div className="font-semibold text-[#464B71]">Copper Coil Spool 50m</div>
                      <div className="text-[10px] font-mono text-[#646981]">SKU-COP-12 · Zone C-02 (Bin 1)</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-[#464B71]">115 Spools</div>
                      <div className="text-[10px] text-[#73D0C3] font-semibold">In Stock</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F2F2ED]/40 border border-[rgba(70,75,113,0.06)]">
                    <div>
                      <div className="font-semibold text-[#464B71]">Ergonomic Office Chair</div>
                      <div className="text-[10px] font-mono text-[#646981]">SKU-CHR-88 · Zone B-04 (Rack 2)</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-[#168FB3]">8 Units</div>
                      <div className="text-[10px] text-[#168FB3] font-semibold">Reorder Alert</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "receipts" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-mono font-bold text-[#168FB3] uppercase tracking-wider">
                  03 · Inwarding & Validation
                </span>
                <h3 className="text-2xl font-bold text-[#464B71]">
                  Incoming goods validated with atomic precision.
                </h3>
                <p className="text-xs sm:text-sm text-[#646981] leading-relaxed">
                  Record supplier shipments, inspect line items upon dock arrival, and atomically increment warehouse location inventories with exact ledger tracking.
                </p>
                <ul className="space-y-2 text-xs text-[#464B71] font-medium pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                    Guaranteed single state transition (READY → DONE)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                    Automatic sequence document numbers (REC-YYYY-XXXX)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                    Supplier attribution and itemized inspection notes
                  </li>
                </ul>
                <div className="pt-2">
                  <Link
                    href="/operations/receipts"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#168FB3] hover:underline"
                  >
                    View receipts workflow →
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 bg-[#FFFFFF] rounded-xl border border-[rgba(70,75,113,0.12)] p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-[rgba(70,75,113,0.06)] pb-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#464B71]">Receipt REC-2026-0042</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#73D0C3]/20 text-[#168FB3]">
                      DONE
                    </span>
                  </div>
                  <span className="text-[10px] text-[#646981]">Supplier: Acme Industrial Supplies</span>
                </div>
                <div className="p-3 rounded-lg bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.06)] space-y-2 text-xs">
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-[#464B71]">Industrial Safety Gloves</span>
                    <span className="font-mono font-bold text-[#168FB3]">+50 Units</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-[#646981]">
                    <span>Putaway Location: Central Hub (Zone A-01)</span>
                    <span className="font-mono text-[10px]">Ledger: 240 → 290</span>
                  </div>
                </div>
                <div className="text-[11px] text-[#646981] flex items-center gap-1.5 pt-1">
                  <Clock className="h-3.5 w-3.5 text-[#168FB3]" />
                  <span>Validated by Warehouse Staff · Logged in immutable StockLedger</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "deliveries" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-mono font-bold text-[#168FB3] uppercase tracking-wider">
                  04 · 4-Stage Fulfillment
                </span>
                <h3 className="text-2xl font-bold text-[#464B71]">
                  From order staging to atomic shipment dispatch.
                </h3>
                <p className="text-xs sm:text-sm text-[#646981] leading-relaxed">
                  Delivery validation enforces state progression: READY → PICKING → PACKED → DONE. Prevents accidental overselling or duplicate fulfillment clicks.
                </p>
                <ul className="space-y-2 text-xs text-[#464B71] font-medium pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                    Conditional atomic decrement prevents negative inventory
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                    Line-by-line item picking and packing verification
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                    Idempotent validation guards against double-clicks
                  </li>
                </ul>
                <div className="pt-2">
                  <Link
                    href="/operations/deliveries"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#168FB3] hover:underline"
                  >
                    View deliveries pipeline →
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 bg-[#FFFFFF] rounded-xl border border-[rgba(70,75,113,0.12)] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[rgba(70,75,113,0.06)] pb-2.5 text-xs">
                  <span className="font-bold text-[#464B71]">Delivery DEL-2026-0081</span>
                  <span className="text-[10px] text-[#646981]">Customer: Apex Logistics Ltd</span>
                </div>

                {/* 4-Stage Status Stepper */}
                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-semibold">
                  <div className="py-1.5 rounded bg-[#464B71]/10 text-[#464B71]">1. READY</div>
                  <div className="py-1.5 rounded bg-[#464B71]/10 text-[#464B71]">2. PICKING</div>
                  <div className="py-1.5 rounded bg-[#464B71]/10 text-[#464B71]">3. PACKED</div>
                  <div className="py-1.5 rounded bg-[#73D0C3]/30 text-[#168FB3] font-bold">4. DONE ✓</div>
                </div>

                <div className="p-3 rounded-lg bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.06)] space-y-1.5 text-xs">
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-[#464B71]">Industrial Safety Gloves</span>
                    <span className="font-mono font-bold text-[#646981]">-25 Units</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-[#646981]">
                    <span>Source: Central Hub (Zone A-01)</span>
                    <span className="font-mono text-[10px]">Ledger: 250 → 225</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "transfers" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-mono font-bold text-[#168FB3] uppercase tracking-wider">
                  05 · Internal Relocation
                </span>
                <h3 className="text-2xl font-bold text-[#464B71]">
                  Zero variance. Absolute aggregate inventory balance.
                </h3>
                <p className="text-xs sm:text-sm text-[#646981] leading-relaxed">
                  Internal transfers simultaneously decrement the source location and increment the destination in one atomic transaction, preserving system-wide quantity invariants.
                </p>
                <ul className="space-y-2 text-xs text-[#464B71] font-medium pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                    Dual StockLedger entries: TRANSFER_OUT and TRANSFER_IN
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                    Total stock before == Total stock after
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                    Cross-warehouse and intra-warehouse bin movements
                  </li>
                </ul>
                <div className="pt-2">
                  <Link
                    href="/operations/transfers"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#168FB3] hover:underline"
                  >
                    View transfer operations →
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 bg-[#FFFFFF] rounded-xl border border-[rgba(70,75,113,0.12)] p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-[rgba(70,75,113,0.06)] pb-2.5 text-xs">
                  <span className="font-bold text-[#464B71]">Transfer TRF-2026-0019</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#73D0C3]/20 text-[#168FB3]">
                    DONE
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.06)] space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#646981]">Source Decrement</span>
                    <div className="font-semibold text-[#464B71]">Central Hub (Zone A-01)</div>
                    <div className="font-mono text-[#646981] font-bold text-xs">-40 units (290 → 250)</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.06)] space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#168FB3]">Destination Increment</span>
                    <div className="font-semibold text-[#464B71]">East Depot (Zone B-02)</div>
                    <div className="font-mono text-[#168FB3] font-bold text-xs">+40 units (0 → 40)</div>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#73D0C3]/15 text-[11px] font-medium text-[#464B71] flex items-center justify-between">
                  <span>Aggregate System Balance</span>
                  <span className="font-mono font-bold text-[#168FB3]">Net Variance: 0.00</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "adjustments" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-mono font-bold text-[#168FB3] uppercase tracking-wider">
                  06 · Cycle Counts & Reconciliation
                </span>
                <h3 className="text-2xl font-bold text-[#464B71]">
                  Row-locked reconciliation without lost updates.
                </h3>
                <p className="text-xs sm:text-sm text-[#646981] leading-relaxed">
                  Physical stock adjustments execute under exclusive PostgreSQL row-level locks, reconciling differences without wiping out concurrent receipts or deliveries.
                </p>
                <ul className="space-y-2 text-xs text-[#464B71] font-medium pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                    PostgreSQL row lock: SELECT ... FOR UPDATE
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                    Mandatory reason codes (Damage, Counting Error, Spoilage)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                    Manager and Admin permission restrictions
                  </li>
                </ul>
                <div className="pt-2">
                  <Link
                    href="/operations/adjustments"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#168FB3] hover:underline"
                  >
                    View cycle count adjustments →
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 bg-[#FFFFFF] rounded-xl border border-[rgba(70,75,113,0.12)] p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-[rgba(70,75,113,0.06)] pb-2.5 text-xs">
                  <span className="font-bold text-[#464B71]">Adjustment ADJ-2026-0005</span>
                  <span className="text-[10px] text-[#646981] font-mono">Row-Lock Reconciled</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5 text-xs text-center">
                  <div className="p-3 rounded-lg bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.06)]">
                    <div className="text-[10px] text-[#646981]">System Quantity</div>
                    <div className="text-base font-mono font-bold text-[#464B71] mt-1">240</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.06)]">
                    <div className="text-[10px] text-[#646981]">Physical Count</div>
                    <div className="text-base font-mono font-bold text-[#168FB3] mt-1">245</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#73D0C3]/20 border border-[rgba(70,75,113,0.06)]">
                    <div className="text-[10px] text-[#168FB3] font-bold">Variance</div>
                    <div className="text-base font-mono font-bold text-[#168FB3] mt-1">+5 Units</div>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F2F2ED]/40 text-[11px] text-[#646981] flex items-center justify-between">
                  <span>Reason Code: COUNTING_ERROR</span>
                  <span className="font-mono text-[10px]">Ledger: 240 → 245</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
