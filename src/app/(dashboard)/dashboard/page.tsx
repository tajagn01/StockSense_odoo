import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Boxes,
  AlertTriangle,
  XCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  TrendingDown,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  PackageCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Query core KPI statistics from PostgreSQL
  const [
    products,
    pendingReceipts,
    pendingDeliveries,
    scheduledTransfers,
    recentLedger,
    warehouses,
  ] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
        inventory: {
          include: { location: true, warehouse: true },
        },
        reorderRules: true,
      },
    }),
    prisma.receipt.findMany({
      where: { status: { in: ["DRAFT", "WAITING", "READY"] } },
      include: { supplier: true, warehouse: true, items: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.delivery.findMany({
      where: { status: { in: ["DRAFT", "WAITING", "READY", "PICKING", "PACKED"] } },
      include: { customer: true, warehouse: true, items: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.transfer.findMany({
      where: { status: { in: ["DRAFT", "WAITING", "READY"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.stockLedger.findMany({
      include: {
        product: true,
        location: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.warehouse.findMany({
      include: {
        inventory: true,
        locations: true,
      },
    }),
  ]);

  // Aggregate product stock metrics
  let totalProductsInStock = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  const criticalItems: Array<{
    id: string;
    name: string;
    sku: string;
    stock: number;
    reorderLevel: number;
    uom: string;
    status: "OUT_OF_STOCK" | "LOW_STOCK";
  }> = [];

  products.forEach((p) => {
    const totalQty = p.inventory.reduce((sum, item) => sum + item.quantity, 0);
    const reorderLevel = p.reorderRules[0]?.reorderLevel ?? 20;

    if (totalQty > 0) {
      totalProductsInStock += 1;
    }

    if (totalQty === 0) {
      outOfStockCount += 1;
      criticalItems.push({
        id: p.id,
        name: p.name,
        sku: p.sku,
        stock: totalQty,
        reorderLevel,
        uom: p.uom,
        status: "OUT_OF_STOCK",
      });
    } else if (totalQty <= reorderLevel) {
      lowStockCount += 1;
      criticalItems.push({
        id: p.id,
        name: p.name,
        sku: p.sku,
        stock: totalQty,
        reorderLevel,
        uom: p.uom,
        status: "LOW_STOCK",
      });
    }
  });

  const kpis = [
    {
      title: "Products in Stock",
      value: totalProductsInStock,
      total: products.length,
      subtitle: `${products.length} registered SKUs`,
      icon: Boxes,
      color: "from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/20",
    },
    {
      title: "Low Stock Items",
      value: lowStockCount,
      subtitle: "Requires purchase replenishment",
      icon: AlertTriangle,
      color: "from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/20",
    },
    {
      title: "Out of Stock Items",
      value: outOfStockCount,
      subtitle: "Zero available inventory",
      icon: XCircle,
      color: "from-rose-500/20 to-red-500/10 text-rose-400 border-rose-500/20",
    },
    {
      title: "Pending Receipts",
      value: pendingReceipts.length,
      subtitle: "Inward shipments to receive",
      icon: ArrowDownToLine,
      color: "from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/20",
    },
    {
      title: "Pending Deliveries",
      value: pendingDeliveries.length,
      subtitle: "Outward orders to pack & dispatch",
      icon: ArrowUpFromLine,
      color: "from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      title: "Transfers Scheduled",
      value: scheduledTransfers.length,
      subtitle: "Internal inter-warehouse routes",
      icon: ArrowLeftRight,
      color: "from-violet-500/20 to-purple-500/10 text-violet-400 border-violet-500/20",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Inventory Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time stock ledger, operations pipeline, and warehouse activity monitoring.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/operations/receipts"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/30 transition"
          >
            <ArrowDownToLine className="h-3.5 w-3.5" />
            <span>Receive Goods</span>
          </Link>
          <Link
            href="/operations/deliveries"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition"
          >
            <ArrowUpFromLine className="h-3.5 w-3.5" />
            <span>New Delivery</span>
          </Link>
          <Link
            href="/operations/adjustments"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Adjust Count</span>
          </Link>
        </div>
      </div>

      {/* 6 Core Problem Statement KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-4 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400 truncate">{kpi.title}</span>
                <div className={`p-2 rounded-lg border bg-gradient-to-br ${kpi.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">{kpi.value}</div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">{kpi.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Critical Reorders & Operations Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Low Stock Alerts & Recent Movements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Low Stock Alerts Widget */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Critical Stock Reorder Alerts</h2>
                  <p className="text-[11px] text-slate-400">Items below minimum safety threshold</p>
                </div>
              </div>
              <Link
                href="/products"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                View all <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {criticalItems.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                <ShieldCheck className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                All inventory levels are currently above reorder thresholds.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="pb-2.5 font-medium">Product / SKU</th>
                      <th className="pb-2.5 font-medium">Current Stock</th>
                      <th className="pb-2.5 font-medium">Reorder Level</th>
                      <th className="pb-2.5 font-medium">Status</th>
                      <th className="pb-2.5 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {criticalItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30">
                        <td className="py-3">
                          <div className="font-medium text-white">{item.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.sku}</div>
                        </td>
                        <td className="py-3 font-semibold text-slate-200">
                          {item.stock} {item.uom}
                        </td>
                        <td className="py-3 text-slate-400">
                          {item.reorderLevel} {item.uom}
                        </td>
                        <td className="py-3">
                          {item.status === "OUT_OF_STOCK" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              Out of Stock
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              Low Stock
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href="/operations/receipts"
                            className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                          >
                            Receive +
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Stock Movements Feed */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
                  <History className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Recent Stock Ledger Entries</h2>
                  <p className="text-[11px] text-slate-400">Append-only audit trail of inventory transactions</p>
                </div>
              </div>
              <Link
                href="/operations/move-history"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                Full ledger <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentLedger.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No stock ledger entries recorded yet.
                </div>
              ) : (
                recentLedger.map((entry) => {
                  const isPositive = entry.quantity > 0;
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            entry.movementType === "RECEIPT"
                              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                              : entry.movementType === "DELIVERY"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : entry.movementType === "ADJUSTMENT"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                          }`}
                        >
                          {entry.movementType.slice(0, 3)}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">
                            {entry.product.name}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>Ref: {entry.referenceId || "N/A"}</span>
                            <span>•</span>
                            <span>By: {entry.user.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`text-xs font-bold ${
                            isPositive ? "text-cyan-400" : "text-rose-400"
                          }`}
                        >
                          {isPositive ? `+${entry.quantity}` : entry.quantity} {entry.product.uom}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Stock: {entry.beforeQuantity} → {entry.afterQuantity}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Operations Pending Pipelines & Warehouse Summary */}
        <div className="space-y-6">
          {/* Inward Pipeline */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <ArrowDownToLine className="h-3.5 w-3.5 text-cyan-400" />
                Pending Receipts
              </h3>
              <Link href="/operations/receipts" className="text-[11px] text-cyan-400 hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-2.5">
              {pendingReceipts.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center">
                  No pending incoming shipments.
                </div>
              ) : (
                pendingReceipts.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{rec.receiptNo}</div>
                      <div className="text-[10px] text-slate-400">{rec.supplier?.name}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {rec.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Outward Deliveries */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <ArrowUpFromLine className="h-3.5 w-3.5 text-emerald-400" />
                Pending Deliveries
              </h3>
              <Link href="/operations/deliveries" className="text-[11px] text-emerald-400 hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-2.5">
              {pendingDeliveries.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center">
                  No pending customer deliveries.
                </div>
              ) : (
                pendingDeliveries.map((del) => (
                  <div
                    key={del.id}
                    className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{del.deliveryNo}</div>
                      <div className="text-[10px] text-slate-400">{del.customer?.name}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {del.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Warehouse Breakdown */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Warehouse Locations
            </h3>
            <div className="space-y-2.5">
              {warehouses.map((wh) => {
                const totalUnits = wh.inventory.reduce((sum, i) => sum + i.quantity, 0);
                return (
                  <div
                    key={wh.id}
                    className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{wh.name}</div>
                      <div className="text-[10px] text-slate-400">
                        Code: {wh.code} • {wh.locations.length} Locations
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-indigo-300">{totalUnits}</span>
                      <span className="text-[10px] text-slate-400 block">units in store</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
