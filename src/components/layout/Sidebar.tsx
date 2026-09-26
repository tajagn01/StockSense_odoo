"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  Warehouse,
  ChevronRight,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  stats?: {
    pendingReceipts?: number;
    pendingDeliveries?: number;
    lowStockCount?: number;
  };
}

export function Sidebar({ stats }: SidebarProps) {
  const pathname = usePathname();

  const mainNav = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      title: "Products & Stock",
      href: "/products",
      icon: Boxes,
      active: pathname.startsWith("/products"),
      badge: stats?.lowStockCount ? `${stats.lowStockCount} low` : undefined,
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    },
  ];

  const operationsNav = [
    {
      title: "Receipts",
      href: "/operations/receipts",
      icon: ArrowDownToLine,
      active: pathname.startsWith("/operations/receipts"),
      badge: stats?.pendingReceipts ? `${stats.pendingReceipts}` : undefined,
      badgeColor: "bg-blue-500/20 text-cyan-400 border-cyan-500/30",
    },
    {
      title: "Delivery Orders",
      href: "/operations/deliveries",
      icon: ArrowUpFromLine,
      active: pathname.startsWith("/operations/deliveries"),
      badge: stats?.pendingDeliveries ? `${stats.pendingDeliveries}` : undefined,
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    },
    {
      title: "Internal Transfers",
      href: "/operations/transfers",
      icon: ArrowLeftRight,
      active: pathname.startsWith("/operations/transfers"),
    },
    {
      title: "Stock Adjustments",
      href: "/operations/adjustments",
      icon: SlidersHorizontal,
      active: pathname.startsWith("/operations/adjustments"),
    },
    {
      title: "Stock Ledger",
      href: "/operations/move-history",
      icon: History,
      active: pathname.startsWith("/operations/move-history"),
    },
  ];

  const settingsNav = [
    {
      title: "Warehouses & Locations",
      href: "/settings/warehouses",
      icon: Warehouse,
      active: pathname.startsWith("/settings/warehouses"),
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/80 backdrop-blur-xl flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand / Logo */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Boxes className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                StockSense
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                IMS Core v1.0
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-6">
          {/* Main */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Overview
            </div>
            <nav className="space-y-1">
              {mainNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                      item.active
                        ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("h-4 w-4", item.active ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200")} />
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", item.badgeColor)}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Operations */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Operations
            </div>
            <nav className="space-y-1">
              {operationsNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                      item.active
                        ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("h-4 w-4", item.active ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200")} />
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", item.badgeColor)}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Configuration */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Settings
            </div>
            <nav className="space-y-1">
              {settingsNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                      item.active
                        ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("h-4 w-4", item.active ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200")} />
                      <span>{item.title}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* User / Session Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-xs text-white shrink-0">
              JM
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-white truncate">John Manager</span>
              <span className="text-[10px] text-slate-400 truncate">Inventory Manager</span>
            </div>
          </div>
          <div className="h-2 w-2 rounded-full bg-emerald-400" title="Online" />
        </div>
      </div>
    </aside>
  );
}
