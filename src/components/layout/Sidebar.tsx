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
      badgeColor: "bg-[#168FB3]/10 text-[#168FB3] border-[#168FB3]/20",
    },
  ];

  const operationsNav = [
    {
      title: "Receipts",
      href: "/operations/receipts",
      icon: ArrowDownToLine,
      active: pathname.startsWith("/operations/receipts"),
      badge: stats?.pendingReceipts ? `${stats.pendingReceipts}` : undefined,
      badgeColor: "bg-[#168FB3]/10 text-[#168FB3] border-[#168FB3]/20",
    },
    {
      title: "Delivery Orders",
      href: "/operations/deliveries",
      icon: ArrowUpFromLine,
      active: pathname.startsWith("/operations/deliveries"),
      badge: stats?.pendingDeliveries ? `${stats.pendingDeliveries}` : undefined,
      badgeColor: "bg-[#73D0C3]/20 text-[#464B71] border-[#73D0C3]/40",
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
    <aside className="w-64 border-r border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand / Logo */}
        <div className="p-5 border-b border-[rgba(70,75,113,0.12)] flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="h-8 w-8 rounded-lg bg-[#464B71] flex items-center justify-center text-white">
              <Boxes className="h-4 w-4 text-[#73D0C3]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-[#464B71]">
                StockSense
              </span>
              <span className="text-[10px] text-[#646981] font-medium tracking-wider">
                Operations Workspace
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-6">
          {/* Main */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#646981]">
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
                      "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all",
                      item.active
                        ? "bg-[#168FB3]/10 text-[#168FB3] font-semibold border-l-2 border-[#168FB3]"
                        : "text-[#646981] hover:text-[#464B71] hover:bg-[#F2F2ED]"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={cn("h-4 w-4", item.active ? "text-[#168FB3]" : "text-[#646981]")} />
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
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#646981]">
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
                      "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all",
                      item.active
                        ? "bg-[#168FB3]/10 text-[#168FB3] font-semibold border-l-2 border-[#168FB3]"
                        : "text-[#646981] hover:text-[#464B71] hover:bg-[#F2F2ED]"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={cn("h-4 w-4", item.active ? "text-[#168FB3]" : "text-[#646981]")} />
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
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#646981]">
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
                      "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all",
                      item.active
                        ? "bg-[#168FB3]/10 text-[#168FB3] font-semibold border-l-2 border-[#168FB3]"
                        : "text-[#646981] hover:text-[#464B71] hover:bg-[#F2F2ED]"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={cn("h-4 w-4", item.active ? "text-[#168FB3]" : "text-[#646981]")} />
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
      <div className="p-3 border-t border-[rgba(70,75,113,0.12)] bg-[#FFFFFF]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-7 w-7 rounded bg-[#464B71] flex items-center justify-center font-bold text-xs text-white shrink-0">
              JM
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-[#464B71] truncate">John Manager</span>
              <span className="text-[10px] text-[#646981] truncate">Inventory Staff</span>
            </div>
          </div>
          <div className="h-2 w-2 rounded-full bg-[#73D0C3]" title="Online" />
        </div>
      </div>
    </aside>
  );
}
