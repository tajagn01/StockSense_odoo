import Link from "next/link";
import {
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  ShieldCheck,
  Warehouse,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
} from "lucide-react";

export default function Home() {
  const operations = [
    {
      title: "Receipts & Inwarding",
      desc: "Incoming purchase shipments, supplier batch tracking, and atomic stock incrementation.",
      icon: ArrowDownToLine,
      color: "from-blue-500/20 to-cyan-500/10 text-cyan-400 border-cyan-500/30",
      href: "/operations/receipts",
    },
    {
      title: "Delivery Orders",
      desc: "Pick, pack, and ship orders with automated stock validation and decrement rules.",
      icon: ArrowUpFromLine,
      color: "from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30",
      href: "/operations/deliveries",
    },
    {
      title: "Internal Transfers",
      desc: "Zero-loss warehouse & location movements keeping enterprise valuation balanced.",
      icon: ArrowLeftRight,
      color: "from-violet-500/20 to-indigo-500/10 text-violet-400 border-violet-500/30",
      href: "/operations/transfers",
    },
    {
      title: "Stock Adjustments",
      desc: "Cycle counting and physical discrepancy reconciliations backed by audit logs.",
      icon: SlidersHorizontal,
      color: "from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30",
      href: "/operations/adjustments",
    },
    {
      title: "Stock Ledger",
      desc: "Immutable append-only chronological history of every unit that moves.",
      icon: History,
      color: "from-pink-500/20 to-rose-500/10 text-pink-400 border-pink-500/30",
      href: "/operations/move-history",
    },
    {
      title: "Multi-Warehouse",
      desc: "Hierarchical bin, aisle, and rack location trees across distributed hubs.",
      icon: Warehouse,
      color: "from-indigo-500/20 to-blue-500/10 text-indigo-400 border-indigo-500/30",
      href: "/settings/warehouses",
    },
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-indigo-500/20 via-blue-500/20 to-cyan-500/20 blur-[130px] rounded-full" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[500px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full" />

      {/* Top Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Boxes className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                StockSense
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                  IMS Engine
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition px-3.5 py-1.5 rounded-lg shadow-sm shadow-indigo-600/30"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Launch Dashboard</span>
            </Link>
            <a
              href="https://github.com/tajagn01/StockSense_odoo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 transition px-3 py-1.5 rounded-lg border border-slate-800"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Built for High-Velocity Inventory Operations
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Centralized Inventory.{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-cyan-400 bg-clip-text text-transparent">
              Zero Discrepancies.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto mb-8">
            StockSense replaces manual registers with an auditable,
            real-time inventory ledger, automated picking & delivery rules, and multi-location logistics.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Enter Operational Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm transition"
            >
              <Boxes className="h-4 w-4 text-indigo-400" />
              <span>Browse Catalog & SKUs</span>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-lg">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Neon PostgreSQL Connected
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-lg">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Prisma ORM Generated
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-lg">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Immutable Stock Ledger
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {operations.map((op, idx) => {
            const Icon = op.icon;
            return (
              <Link
                key={idx}
                href={op.href}
                className="group relative rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-6 hover:border-slate-700 hover:bg-slate-900/70 transition-all duration-300 block"
              >
                <div
                  className={`inline-flex items-center justify-center p-3 rounded-xl border bg-gradient-to-br ${op.color} mb-4`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition">
                    {op.title}
                  </h3>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {op.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 px-6 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 StockSense. Ready for operations with Next.js App Router & PostgreSQL.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              StockSense Specification V1.0 Compliant
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
