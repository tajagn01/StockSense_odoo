import Link from "next/link";
import {
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const modules = [
    {
      title: "Products & Stock",
      desc: "Maintain your master catalog, track SKU specifications, and monitor real-time availability across facilities.",
      icon: Boxes,
      href: "/products",
    },
    {
      title: "Inward Receipts",
      desc: "Record vendor shipments, inspect line items, and validate immediate stock increments into assigned bins.",
      icon: ArrowDownToLine,
      href: "/operations/receipts",
    },
    {
      title: "Delivery Orders",
      desc: "Process customer shipments with live inventory reservation, picking validation, and atomic decrement rules.",
      icon: ArrowUpFromLine,
      href: "/operations/deliveries",
    },
    {
      title: "Internal Transfers",
      desc: "Relocate materials between warehouses and storage locations while preserving absolute inventory valuation.",
      icon: ArrowLeftRight,
      href: "/operations/transfers",
    },
    {
      title: "Stock Adjustments",
      desc: "Conduct physical cycle counts, reconcile variance discrepancies automatically, and record reason codes.",
      icon: SlidersHorizontal,
      href: "/operations/adjustments",
    },
    {
      title: "Stock Ledger",
      desc: "An immutable chronological audit log tracking every movement, before/after balances, and user attribution.",
      icon: History,
      href: "/operations/move-history",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F2F2ED] text-[#464B71] flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#464B71] flex items-center justify-center">
              <Boxes className="h-4 w-4 text-[#73D0C3]" />
            </div>
            <span className="font-bold text-lg tracking-tight text-[#464B71]">
              StockSense
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-[#464B71] hover:text-[#168FB3] transition px-3 py-1.5"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-white bg-[#168FB3] hover:bg-[#127492] transition px-4 py-2 rounded-lg"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero & Content */}
      <main className="max-w-7xl mx-auto px-6 py-16 flex-1 w-full space-y-20">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#464B71] leading-tight">
            Know your stock.
            <span className="block text-[#168FB3] mt-1">Move it with confidence.</span>
          </h1>
          <p className="text-base sm:text-lg text-[#646981] leading-relaxed max-w-2xl mx-auto">
            StockSense brings products, warehouses, receipts, deliveries, transfers, and stock adjustments into one clear operational workspace.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#464B71] hover:bg-[#373b5a] text-white font-semibold text-sm transition shadow-sm"
            >
              <span>Enter StockSense</span>
              <ArrowRight className="h-4 w-4 text-[#73D0C3]" />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#FFFFFF] hover:bg-[#F2F2ED] text-[#464B71] border border-[rgba(70,75,113,0.15)] font-semibold text-sm transition shadow-sm"
            >
              <span>Explore inventory</span>
            </Link>
          </div>
        </div>

        {/* Realistic Product Dashboard Preview */}
        <div className="w-full max-w-5xl mx-auto rounded-xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] shadow-sm overflow-hidden">
          {/* Mock App Chrome */}
          <div className="border-b border-[rgba(70,75,113,0.12)] bg-[#F2F2ED] px-4 py-3 flex items-center justify-between text-xs text-[#646981]">
            <div className="flex items-center gap-2 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-[#73D0C3]" />
              <span className="font-semibold text-[#464B71]">StockSense Workspace</span>
              <span>— Operations Overview</span>
            </div>
            <span className="text-[11px] text-[#646981]">Live Inventory Status</span>
          </div>

          <div className="p-6 space-y-6">
            {/* KPI Cards Row */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#646981] mb-3">
                Inventory at a glance
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)]">
                  <div className="text-xs text-[#646981]">Products in stock</div>
                  <div className="text-2xl font-bold text-[#464B71] mt-1">1,248</div>
                </div>
                <div className="p-4 rounded-lg bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)]">
                  <div className="text-xs text-[#646981]">Low stock</div>
                  <div className="text-2xl font-bold text-[#168FB3] mt-1">18</div>
                </div>
                <div className="p-4 rounded-lg bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)]">
                  <div className="text-xs text-[#646981]">Pending receipts</div>
                  <div className="text-2xl font-bold text-[#464B71] mt-1">7</div>
                </div>
                <div className="p-4 rounded-lg bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)]">
                  <div className="text-xs text-[#646981]">Pending deliveries</div>
                  <div className="text-2xl font-bold text-[#464B71] mt-1">12</div>
                </div>
              </div>
            </div>

            {/* Split Data Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Recent Movement Table */}
              <div className="p-4 rounded-lg border border-[rgba(70,75,113,0.10)] bg-[#FFFFFF]">
                <div className="text-xs font-semibold text-[#464B71] mb-3">Recent movement</div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[rgba(70,75,113,0.06)]">
                    <span className="font-medium text-[#464B71]">Steel Rods</span>
                    <span className="font-mono font-semibold text-[#168FB3]">+50</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-[rgba(70,75,113,0.06)]">
                    <span className="font-medium text-[#464B71]">Chairs</span>
                    <span className="font-mono font-semibold text-[#646981]">-20</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#464B71]">Copper Wire</span>
                    <span className="font-mono font-semibold text-[#168FB3]">+24</span>
                  </div>
                </div>
              </div>

              {/* Locations Panel */}
              <div className="p-4 rounded-lg border border-[rgba(70,75,113,0.10)] bg-[#FFFFFF]">
                <div className="text-xs font-semibold text-[#464B71] mb-3">Locations</div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[rgba(70,75,113,0.06)]">
                    <span className="font-medium text-[#464B71]">Central Logistics Hub</span>
                    <span className="font-mono font-semibold text-[#464B71]">824 units</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#464B71]">East Distribution Depot</span>
                    <span className="font-mono font-semibold text-[#464B71]">424 units</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Step Workflow Section */}
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#464B71]">How Stock Moves Through StockSense</h2>
            <p className="text-xs sm:text-sm text-[#646981] mt-1">A transparent, auditable cycle from inwarding to final dispatch.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF]">
              <div className="text-xs font-mono font-bold text-[#168FB3] mb-2">01 — Receive</div>
              <h3 className="text-sm font-bold text-[#464B71] mb-1.5">Inward Validation</h3>
              <p className="text-xs text-[#646981] leading-relaxed">
                Add incoming goods from suppliers and automatically increment stock upon physical inspection and validation.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF]">
              <div className="text-xs font-mono font-bold text-[#168FB3] mb-2">02 — Move</div>
              <h3 className="text-sm font-bold text-[#464B71] mb-1.5">Internal Transfers</h3>
              <p className="text-xs text-[#646981] leading-relaxed">
                Transfer stock between warehouses and internal locations with zero net variance and atomic ledger balance.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF]">
              <div className="text-xs font-mono font-bold text-[#168FB3] mb-2">03 — Reconcile</div>
              <h3 className="text-sm font-bold text-[#464B71] mb-1.5">Count & Audit</h3>
              <p className="text-xs text-[#646981] leading-relaxed">
                Adjust physical counts, calculate differences immediately, and preserve the permanent immutable ledger trail.
              </p>
            </div>
          </div>
        </div>

        {/* Operational Workspace Modules */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#464B71]">
              An operational workspace, not a pile of spreadsheets.
            </h2>
            <p className="text-xs sm:text-sm text-[#646981] mt-2">
              Jump directly into the workflow you need. The interface stays focused on the data and actions that keep inventory moving.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((m, idx) => {
              const Icon = m.icon;
              return (
                <Link
                  key={idx}
                  href={m.href}
                  className="group rounded-xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] p-6 hover:border-[rgba(70,75,113,0.25)] hover:shadow-sm transition block"
                >
                  <div className="h-10 w-10 rounded-lg bg-[#73D0C3]/20 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-[#464B71]" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold text-[#464B71] group-hover:text-[#168FB3] transition">
                      {m.title}
                    </h3>
                    <ArrowRight className="h-4 w-4 text-[#168FB3] group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-[#646981] leading-relaxed">
                    {m.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Minimal Deep Purple CTA Section */}
        <div className="rounded-2xl bg-[#464B71] text-white p-10 sm:p-14 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-block px-3 py-1 rounded-full bg-[#73D0C3]/20 text-[#73D0C3] text-xs font-semibold">
            Ready for Operations
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Take full control of your warehouse flow today.
          </h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto">
            Experience reliable receipts, order validation, internal transfers, and real-time inventory ledger tracking.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#73D0C3] text-[#464B71] hover:bg-[#73D0C3]/90 font-bold text-sm transition shadow-sm"
            >
              <span>Open dashboard</span>
              <ArrowRight className="h-4 w-4 text-[#464B71]" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] px-6 py-6 text-center text-xs text-[#646981]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-[#464B71]">
            <Boxes className="h-4 w-4 text-[#168FB3]" />
            <span>StockSense Operations</span>
          </div>
          <p>© 2026 StockSense. Enterprise inventory management system.</p>
        </div>
      </footer>
    </div>
  );
}
