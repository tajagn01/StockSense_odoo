"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { X } from "lucide-react";

interface DashboardShellProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  warehouses: Array<{ id: string; name: string; code: string }>;
  stats: {
    pendingReceipts?: number;
    pendingDeliveries?: number;
    lowStockCount?: number;
  };
  children: React.ReactNode;
}

export function DashboardShell({ user, warehouses, stats, children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F2F2ED] text-[#464B71]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar user={user} stats={stats} />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/40 backdrop-blur-xs flex">
          <div className="relative flex-1 max-w-xs bg-white h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-[#646981] hover:text-[#464B71] rounded-lg z-50 bg-[#F2F2ED]"
              aria-label="Close mobile menu"
            >
              <X className="h-4 w-4" />
            </button>
            <Sidebar
              user={user}
              stats={stats}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          user={user}
          warehouses={warehouses}
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
