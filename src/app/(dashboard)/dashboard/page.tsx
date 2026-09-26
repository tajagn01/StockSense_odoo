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
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
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
      subtitle: `${products.length} registered SKUs`,
      icon: Boxes,
      highlight: false,
    },
    {
      title: "Low Stock Items",
      value: lowStockCount,
      subtitle: "Below reorder threshold",
      icon: AlertTriangle,
      highlight: lowStockCount > 0,
    },
    {
      title: "Out of Stock Items",
      value: outOfStockCount,
      subtitle: "Zero inventory available",
      icon: XCircle,
      highlight: outOfStockCount > 0,
    },
    {
      title: "Pending Receipts",
      value: pendingReceipts.length,
      subtitle: "Inward shipments queued",
      icon: ArrowDownToLine,
      highlight: false,
    },
    {
      title: "Pending Deliveries",
      value: pendingDeliveries.length,
      subtitle: "Outward orders to pack",
      icon: ArrowUpFromLine,
      highlight: false,
    },
    {
      title: "Transfers Scheduled",
      value: scheduledTransfers.length,
      subtitle: "Inter-location movement",
      icon: ArrowLeftRight,
      highlight: false,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[rgba(70,75,113,0.12)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#464B71]">
            Operations Dashboard
          </h1>
          <p className="text-xs text-[#646981] mt-0.5">
            Real-time stock status, operational workflow pipelines, and audit ledger feed.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2">
          <Link
            href="/operations/receipts"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FFFFFF] text-[#464B71] border border-[rgba(70,75,113,0.15)] hover:bg-[#F2F2ED] transition"
          >
            <ArrowDownToLine className="h-3.5 w-3.5 text-[#168FB3]" />
            <span>Receive Goods</span>
          </Link>
          <Link
            href="/operations/deliveries"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FFFFFF] text-[#464B71] border border-[rgba(70,75,113,0.15)] hover:bg-[#F2F2ED] transition"
          >
            <ArrowUpFromLine className="h-3.5 w-3.5 text-[#168FB3]" />
            <span>New Delivery</span>
          </Link>
          <Link
            href="/operations/adjustments"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#168FB3] text-white hover:bg-[#127492] transition"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Count Adjustment</span>
          </Link>
        </div>
      </div>

      {/* 6 Unified Coherent KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="rounded-xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] p-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#646981] truncate">{kpi.title}</span>
                <div className="p-1.5 rounded-md bg-[#F2F2ED] text-[#464B71]">
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#464B71] tracking-tight">{kpi.value}</div>
                <p className="text-[10px] text-[#646981] mt-0.5 truncate">{kpi.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Low Stock Alerts & Ledger Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Low Stock Alerts */}
          <div className="rounded-xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-[#464B71]">Critical Reorder Items</h2>
                <p className="text-[11px] text-[#646981]">Products currently below safety reorder threshold</p>
              </div>
              <Link
                href="/products"
                className="text-xs text-[#168FB3] hover:underline flex items-center gap-1 font-semibold"
              >
                All products <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {criticalItems.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#646981]">
                <ShieldCheck className="h-6 w-6 text-[#73D0C3] mx-auto mb-1.5" />
                All stock levels are currently above minimum safety thresholds.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F2F2ED] text-[11px] uppercase tracking-wider text-[#646981] border-y border-[rgba(70,75,113,0.08)]">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Product</th>
                      <th className="py-2.5 px-3 font-semibold">SKU</th>
                      <th className="py-2.5 px-3 font-semibold">Current</th>
                      <th className="py-2.5 px-3 font-semibold">Reorder Level</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(70,75,113,0.08)]">
                    {criticalItems.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F2F2ED]/60 transition">
                        <td className="py-2.5 px-3 font-semibold text-[#464B71]">{item.name}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#646981]">{item.sku}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#464B71]">
                          {item.stock} {item.uom}
                        </td>
                        <td className="py-2.5 px-3 text-[#646981]">
                          {item.reorderLevel} {item.uom}
                        </td>
                        <td className="py-2.5 px-3">
                          {item.status === "OUT_OF_STOCK" ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              Out of Stock
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Low Stock
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Link
                            href="/operations/receipts"
                            className="text-xs font-semibold text-[#168FB3] hover:underline"
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

          {/* Recent Ledger Entries */}
          <div className="rounded-xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-[#464B71]">Recent Stock Ledger Entries</h2>
                <p className="text-[11px] text-[#646981]">Append-only record of movements and transactions</p>
              </div>
              <Link
                href="/operations/move-history"
                className="text-xs text-[#168FB3] hover:underline flex items-center gap-1 font-semibold"
              >
                View full ledger <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {recentLedger.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#646981]">
                  No ledger activity logged yet.
                </div>
              ) : (
                recentLedger.map((entry) => {
                  const isPositive = entry.quantity > 0;
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-[rgba(70,75,113,0.08)] bg-[#FFFFFF] hover:bg-[#F2F2ED]/50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F2F2ED] text-[#464B71] border border-[rgba(70,75,113,0.10)] font-mono">
                          {entry.movementType}
                        </span>
                        <div>
                          <div className="text-xs font-semibold text-[#464B71]">
                            {entry.product.name}
                          </div>
                          <div className="text-[10px] text-[#646981] flex items-center gap-2">
                            <span>Ref: {entry.referenceId || "N/A"}</span>
                            <span>•</span>
                            <span>By: {entry.user.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-xs font-bold font-mono ${
                            isPositive ? "text-[#168FB3]" : "text-[#464B71]"
                          }`}
                        >
                          {isPositive ? `+${entry.quantity}` : entry.quantity} {entry.product.uom}
                        </span>
                        <div className="text-[10px] text-[#646981]">
                          Balance: {entry.beforeQuantity} → {entry.afterQuantity}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Operations Pipelines & Warehouse Summary */}
        <div className="space-y-6">
          {/* Inward Pipeline */}
          <div className="rounded-xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#464B71] uppercase tracking-wider flex items-center gap-1.5">
                <ArrowDownToLine className="h-3.5 w-3.5 text-[#168FB3]" />
                Pending Receipts
              </h3>
              <Link href="/operations/receipts" className="text-xs text-[#168FB3] font-semibold hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-2">
              {pendingReceipts.length === 0 ? (
                <div className="text-xs text-[#646981] py-4 text-center">
                  No incoming shipments queued.
                </div>
              ) : (
                pendingReceipts.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-lg bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)] flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#464B71]">{rec.receiptNo}</div>
                      <div className="text-[10px] text-[#646981]">{rec.supplier?.name}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#168FB3]/10 text-[#168FB3] border border-[#168FB3]/20">
                      {rec.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Outward Deliveries */}
          <div className="rounded-xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#464B71] uppercase tracking-wider flex items-center gap-1.5">
                <ArrowUpFromLine className="h-3.5 w-3.5 text-[#168FB3]" />
                Pending Deliveries
              </h3>
              <Link href="/operations/deliveries" className="text-xs text-[#168FB3] font-semibold hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-2">
              {pendingDeliveries.length === 0 ? (
                <div className="text-xs text-[#646981] py-4 text-center">
                  No pending customer dispatches.
                </div>
              ) : (
                pendingDeliveries.map((del) => (
                  <div
                    key={del.id}
                    className="p-3 rounded-lg bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)] flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#464B71]">{del.deliveryNo}</div>
                      <div className="text-[10px] text-[#646981]">{del.customer?.name}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#73D0C3]/20 text-[#464B71] border border-[#73D0C3]/40">
                      {del.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Warehouse Facility Breakdown */}
          <div className="rounded-xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#464B71] uppercase tracking-wider">
                Warehouses
              </h3>
              <Link href="/settings/warehouses" className="text-xs text-[#168FB3] font-semibold hover:underline">
                Settings
              </Link>
            </div>
            <div className="space-y-2">
              {warehouses.map((wh) => {
                const totalUnits = wh.inventory.reduce((sum, i) => sum + i.quantity, 0);
                return (
                  <div
                    key={wh.id}
                    className="p-3 rounded-lg bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)] flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#464B71]">{wh.name}</div>
                      <div className="text-[10px] text-[#646981]">
                        Code: {wh.code} • {wh.locations.length} Locations
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#168FB3]">{totalUnits}</span>
                      <span className="text-[10px] text-[#646981] block">units</span>
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
