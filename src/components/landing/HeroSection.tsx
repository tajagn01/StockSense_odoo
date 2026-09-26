import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  AlertTriangle,
  Layers,
  MapPin,
  ShieldCheck,
} from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Subtle Background Radial Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#464B71_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Header Copy */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] shadow-xs">
            <span className="h-2 w-2 rounded-full bg-[#73D0C3] animate-pulse" />
            <span className="text-[11px] font-semibold text-[#464B71]">
              Modern Inventory Management
            </span>
            <span className="text-[#646981] text-[10px]">·</span>
            <span className="text-[11px] text-[#646981] font-medium">Next-Gen SaaS</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#464B71] leading-[1.08]">
            Inventory, without the
            <span className="block text-[#168FB3] mt-1 sm:mt-1.5">blind spots.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#646981] leading-relaxed max-w-2xl mx-auto pt-1 font-normal">
            StockSense gives your team a single, reliable system for managing inventory, warehouses,
            movements, and fulfillment—without the complexity of legacy ERP software.
          </p>

          {/* CTA Group */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#464B71] hover:bg-[#373b5a] text-white font-semibold text-xs sm:text-sm transition shadow-sm hover:shadow group"
            >
              <span>Start using StockSense</span>
              <ArrowRight className="h-4 w-4 text-[#73D0C3] group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#product-showcase"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F2F2ED] text-[#464B71] border border-[rgba(70,75,113,0.14)] font-semibold text-xs sm:text-sm transition shadow-2xs"
            >
              <span>Explore the platform</span>
            </a>
          </div>

          {/* Architecture Trust Signals */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-[#646981]">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#168FB3]" />
              Role-Based Access Control
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#73D0C3]" />
              Atomic PostgreSQL Ledger
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-[#464B71]" />
              Multi-Warehouse Topology
            </span>
          </div>
        </div>

        {/* Hero Visual: Realistic StockSense Product Interface Mockup */}
        <div className="mt-12 sm:mt-16 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-[rgba(70,75,113,0.14)] bg-[#FFFFFF] shadow-[0_20px_60px_-15px_rgba(70,75,113,0.12)] overflow-hidden">
            {/* Realistic Application Chrome Bar */}
            <div className="bg-[#F2F2ED] border-b border-[rgba(70,75,113,0.10)] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#464B71]/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#464B71]/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#464B71]/20" />
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#FFFFFF] border border-[rgba(70,75,113,0.08)] text-[11px] text-[#646981] font-mono">
                  <span className="text-[#168FB3]">https://</span>
                  <span>app.stocksense.io/dashboard</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#646981]">
                <span className="h-2 w-2 rounded-full bg-[#73D0C3]" />
                <span className="font-medium text-[#464B71]">Central Logistics Hub</span>
                <span className="hidden sm:inline text-[#646981]">· Node Active</span>
              </div>
            </div>

            {/* Inner Dashboard View */}
            <div className="p-4 sm:p-6 lg:p-7 space-y-6 bg-[#FFFFFF]">
              {/* Top Row: Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-xl bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)]">
                  <div className="flex items-center justify-between text-xs text-[#646981]">
                    <span>Total Products</span>
                    <Boxes className="h-4 w-4 text-[#464B71]" />
                  </div>
                  <div className="text-2xl font-bold text-[#464B71] mt-2">1,248</div>
                  <div className="text-[10px] text-[#646981] mt-1 font-medium">
                    12 Active Categories
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)]">
                  <div className="flex items-center justify-between text-xs text-[#646981]">
                    <span>Low Stock Alerts</span>
                    <AlertTriangle className="h-4 w-4 text-[#168FB3]" />
                  </div>
                  <div className="text-2xl font-bold text-[#168FB3] mt-2">18</div>
                  <div className="text-[10px] text-[#168FB3] font-medium mt-1">
                    Below reorder thresholds
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)]">
                  <div className="flex items-center justify-between text-xs text-[#646981]">
                    <span>Pending Receipts</span>
                    <ArrowDownToLine className="h-4 w-4 text-[#464B71]" />
                  </div>
                  <div className="text-2xl font-bold text-[#464B71] mt-2">7</div>
                  <div className="text-[10px] text-[#646981] font-medium mt-1">
                    Awaiting dock putaway
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)]">
                  <div className="flex items-center justify-between text-xs text-[#646981]">
                    <span>Pending Deliveries</span>
                    <ArrowUpFromLine className="h-4 w-4 text-[#464B71]" />
                  </div>
                  <div className="text-2xl font-bold text-[#464B71] mt-2">12</div>
                  <div className="text-[10px] text-[#73D0C3] font-medium mt-1">
                    Packed & Ready to Ship
                  </div>
                </div>
              </div>

              {/* Lower Section: Stock Catalog & Movement Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Live Inventory Table Preview (7 cols) */}
                <div className="lg:col-span-7 rounded-xl border border-[rgba(70,75,113,0.10)] bg-[#FFFFFF] p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[rgba(70,75,113,0.06)]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#464B71]">Live Stock Overview</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F2F2ED] text-[#646981]">
                        WH-CENTRAL
                      </span>
                    </div>
                    <span className="text-[11px] text-[#168FB3] font-semibold">View catalog →</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-12 items-center py-2 px-2.5 rounded-lg bg-[#F2F2ED]/40 border border-[rgba(70,75,113,0.06)] font-medium">
                      <div className="col-span-6 flex flex-col">
                        <span className="text-[#464B71] font-semibold">Industrial Safety Gloves</span>
                        <span className="text-[10px] font-mono text-[#646981]">SKU-GLV-01 · Zone A-01</span>
                      </div>
                      <div className="col-span-3 text-right font-mono font-bold text-[#464B71]">
                        240 units
                      </div>
                      <div className="col-span-3 text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#73D0C3]/20 text-[#168FB3]">
                          Optimal
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 items-center py-2 px-2.5 rounded-lg bg-[#F2F2ED]/40 border border-[rgba(70,75,113,0.06)] font-medium">
                      <div className="col-span-6 flex flex-col">
                        <span className="text-[#464B71] font-semibold">Ergonomic Office Chair</span>
                        <span className="text-[10px] font-mono text-[#646981]">SKU-CHR-88 · Zone B-04</span>
                      </div>
                      <div className="col-span-3 text-right font-mono font-bold text-[#168FB3]">
                        8 units
                      </div>
                      <div className="col-span-3 text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#168FB3]/15 text-[#168FB3]">
                          Low Stock
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 items-center py-2 px-2.5 rounded-lg bg-[#F2F2ED]/40 border border-[rgba(70,75,113,0.06)] font-medium">
                      <div className="col-span-6 flex flex-col">
                        <span className="text-[#464B71] font-semibold">Copper Coil Spool 50m</span>
                        <span className="text-[10px] font-mono text-[#646981]">SKU-COP-12 · Zone C-02</span>
                      </div>
                      <div className="col-span-3 text-right font-mono font-bold text-[#464B71]">
                        115 units
                      </div>
                      <div className="col-span-3 text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#73D0C3]/20 text-[#168FB3]">
                          Optimal
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real-time Movement & Facility Panel (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Stock Ledger Feed */}
                  <div className="rounded-xl border border-[rgba(70,75,113,0.10)] bg-[#FFFFFF] p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[rgba(70,75,113,0.06)]">
                      <span className="text-xs font-bold text-[#464B71]">Live Movement Ledger</span>
                      <span className="text-[10px] text-[#646981]">Continuous Chain</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between py-1 border-b border-[rgba(70,75,113,0.04)]">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-[#73D0C3]/20 text-[#168FB3] text-[9px] font-bold">
                            REC
                          </span>
                          <span className="text-[#464B71] font-medium text-[11px]">REC-2026-0042</span>
                        </div>
                        <span className="font-mono font-bold text-[#168FB3] text-xs">+50 units</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-[rgba(70,75,113,0.04)]">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-[#464B71]/15 text-[#464B71] text-[9px] font-bold">
                            DEL
                          </span>
                          <span className="text-[#464B71] font-medium text-[11px]">DEL-2026-0081</span>
                        </div>
                        <span className="font-mono font-bold text-[#646981] text-xs">-15 units</span>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-[#168FB3]/15 text-[#168FB3] text-[9px] font-bold">
                            TRF
                          </span>
                          <span className="text-[#464B71] font-medium text-[11px]">TRF-2026-0019</span>
                        </div>
                        <span className="font-mono font-bold text-[#464B71] text-xs">40 moved</span>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Warehouse Status Bar */}
                  <div className="rounded-xl border border-[rgba(70,75,113,0.10)] bg-[#F2F2ED]/60 p-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#168FB3]" />
                      <div>
                        <div className="font-bold text-[#464B71] text-[11px]">2 Facilities Active</div>
                        <div className="text-[10px] text-[#646981]">Central Hub & East Depot</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-[#464B71]">1,248 Units</div>
                      <div className="text-[10px] text-[#73D0C3] font-semibold">100% Reconciled</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
