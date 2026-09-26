"use client";

import { useState } from "react";
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
  ShieldCheck,
  FolderTree,
  Repeat,
  LogOut,
  User as UserIcon,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/authActions";

interface SidebarProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  stats?: {
    pendingReceipts?: number;
    pendingDeliveries?: number;
    lowStockCount?: number;
  };
  onCloseMobile?: () => void;
}

export function Sidebar({ user, stats, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Generate initials (e.g., "TG" or "JM")
  const getInitials = (name?: string) => {
    if (!name) return "SS";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatRole = (role?: string) => {
    if (!role) return "Warehouse Staff";
    return role
      .split("_")
      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
      .join(" ");
  };

  const isAdminOrManager = user?.role === "ADMIN" || user?.role === "INVENTORY_MANAGER";

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
      active: pathname === "/products" || pathname.startsWith("/products/"),
      badge: stats?.lowStockCount ? `${stats.lowStockCount} low` : undefined,
      badgeColor: "bg-[#168FB3]/10 text-[#168FB3] border-[#168FB3]/20",
    },
  ];

  if (isAdminOrManager) {
    mainNav.push(
      {
        title: "Categories",
        href: "/products/categories",
        icon: FolderTree,
        active: pathname === "/products/categories",
      } as any,
      {
        title: "Reorder Rules",
        href: "/products/reordering",
        icon: Repeat,
        active: pathname === "/products/reordering",
      } as any
    );
  }

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

  if (user?.role === "ADMIN" || user?.role === "INVENTORY_MANAGER") {
    settingsNav.push({
      title: "System Audit Trail",
      href: "/settings/audit-log",
      icon: ShieldCheck,
      active: pathname === "/settings/audit-log",
    });
  }

  const handleLinkClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-64 border-r border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand / Logo */}
        <div className="p-5 border-b border-[rgba(70,75,113,0.12)] flex items-center justify-between">
          <Link href="/dashboard" onClick={handleLinkClick} className="flex items-center gap-3 group">
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
          {/* Main / Inventory */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#646981]">
              Inventory & Catalog
            </div>
            <nav className="space-y-1">
              {mainNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
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
                    onClick={handleLinkClick}
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

          {/* Settings */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#646981]">
              Administration
            </div>
            <nav className="space-y-1">
              {settingsNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
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

      {/* User / Session Footer with Interactive Menu */}
      <div className="p-3 border-t border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] relative">
        {isUserMenuOpen && (
          <div className="absolute bottom-16 left-3 right-3 bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <Link
              href="/profile"
              onClick={() => { setIsUserMenuOpen(false); handleLinkClick(); }}
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#464B71] hover:bg-[#F2F2ED] rounded-lg transition font-medium"
            >
              <UserIcon className="h-4 w-4 text-[#168FB3]" />
              <span>Operator Profile</span>
            </Link>
            <button
              onClick={async () => {
                setIsUserMenuOpen(false);
                await logoutAction();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
            >
              <LogOut className="h-4 w-4 text-red-500" />
              <span>Log Out</span>
            </button>
          </div>
        )}

        <div
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="flex items-center justify-between p-2 rounded-lg bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)] cursor-pointer hover:bg-[#F2F2ED] transition"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-7 w-7 rounded bg-[#464B71] flex items-center justify-center font-bold text-xs text-white shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-[#464B71] truncate">
                {user?.name || "StockSense Operator"}
              </span>
              <span className="text-[10px] text-[#646981] truncate">
                {formatRole(user?.role)}
              </span>
            </div>
          </div>
          <ChevronUp className={cn("h-3.5 w-3.5 text-[#646981] transition", isUserMenuOpen && "rotate-180")} />
        </div>
      </div>
    </aside>
  );
}
