"use client";

import { useState, useEffect } from "react";
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
  Menu,
  Check,
  CheckCheck,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { GlobalSearchModal } from "./GlobalSearchModal";
import {
  getUserNotifications,
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/app/actions/notificationActions";

interface TopbarProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  warehouses?: Array<{ id: string; name: string; code: string }>;
  onToggleMobileMenu?: () => void;
}

export function Topbar({ user, warehouses = [], onToggleMobileMenu }: TopbarProps) {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("ALL");
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Notification state
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Load notifications
  useEffect(() => {
    async function loadNotifications() {
      const res = await getUserNotifications();
      setUnreadCount(res.unreadCount);
      setNotifications(res.notifications);
    }
    loadNotifications();
  }, []);

  // Global Ctrl + K / Cmd + K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleMarkRead = async (id: string) => {
    await markNotificationReadAction(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date() } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsReadAction();
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date() })));
    setUnreadCount(0);
  };

  return (
    <>
      <header className="h-16 border-b border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          {/* Mobile Menu Hamburger */}
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-[#646981] hover:text-[#464B71] hover:bg-[#F2F2ED]"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search Trigger Button */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="w-full flex items-center justify-between bg-[#F2F2ED] border border-[rgba(70,75,113,0.12)] rounded-lg px-3 py-1.5 text-xs text-[#646981] hover:border-[#168FB3] transition"
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-[#646981]" />
              <span className="hidden sm:inline">Search SKU, product, receipt, delivery...</span>
              <span className="sm:hidden">Search...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-[#646981] bg-white border border-[rgba(70,75,113,0.15)] rounded">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Warehouse Selector */}
          <div className="hidden lg:flex items-center">
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

          {/* Notifications Bell & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 rounded-lg bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] text-[#646981] hover:text-[#464B71] hover:bg-[#F2F2ED] transition"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#168FB3] text-[9px] font-bold text-white flex items-center justify-center ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
                onMouseLeave={() => setIsNotificationsOpen(false)}
              >
                <div className="p-3.5 border-b border-[rgba(70,75,113,0.10)] flex items-center justify-between bg-[#FFFFFF]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#464B71]">Operational Alerts</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-[#168FB3]/10 text-[#168FB3] font-semibold px-2 py-0.5 rounded-full">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-[#168FB3] hover:underline flex items-center gap-1 font-medium"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[rgba(70,75,113,0.06)]">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#646981]">
                      No notifications or operational alerts at this time.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs transition ${
                          !n.readAt ? "bg-[#168FB3]/5" : "bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold text-[#464B71]">{n.title}</div>
                            <div className="text-[11px] text-[#646981] mt-0.5 leading-relaxed">
                              {n.message}
                            </div>
                            <div className="text-[10px] text-[#646981]/70 mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(n.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                          {!n.readAt && (
                            <button
                              onClick={() => handleMarkRead(n.id)}
                              className="p-1 text-[#646981] hover:text-[#168FB3] rounded"
                              title="Mark read"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar Link */}
          {user && (
            <Link
              href="/profile"
              className="flex items-center gap-2 p-1 pl-2 bg-[#F2F2ED] hover:bg-[#168FB3]/10 border border-[rgba(70,75,113,0.12)] rounded-lg transition"
              title="Operator Profile"
            >
              <span className="text-xs font-semibold text-[#464B71] hidden md:inline truncate max-w-[120px]">
                {user.name}
              </span>
              <span className="h-6 w-6 rounded bg-[#464B71] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {user.name.slice(0, 2).toUpperCase()}
              </span>
            </Link>
          )}
        </div>
      </header>

      {/* Global Search Ctrl + K Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </>
  );
}
