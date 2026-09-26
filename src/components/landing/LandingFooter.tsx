import Link from "next/link";
import { Boxes } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] py-14 text-xs text-[#646981]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#464B71] flex items-center justify-center text-white">
                <Boxes className="h-4.5 w-4.5 text-[#73D0C3]" />
              </div>
              <span className="font-bold text-lg tracking-tight text-[#464B71]">
                StockSense
              </span>
            </Link>
            <p className="text-xs text-[#646981] leading-relaxed max-w-sm">
              Unified operational inventory management. Real-time receipts, deliveries, internal transfers, cycle count adjustments, and immutable PostgreSQL stock ledger.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#464B71]">
              <span className="h-2 w-2 rounded-full bg-[#73D0C3]" />
              <span>Production Core v1.0 · Concurrency Safe</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#464B71]">
              Product
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#product-showcase" className="hover:text-[#168FB3] transition">
                  Overview
                </a>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#168FB3] transition">
                  Product Catalog
                </Link>
              </li>
              <li>
                <Link href="/settings/warehouses" className="hover:text-[#168FB3] transition">
                  Warehouses & Bins
                </Link>
              </li>
              <li>
                <Link href="/operations/deliveries" className="hover:text-[#168FB3] transition">
                  Fulfillment Deliveries
                </Link>
              </li>
              <li>
                <Link href="/operations/transfers" className="hover:text-[#168FB3] transition">
                  Internal Transfers
                </Link>
              </li>
            </ul>
          </div>

          {/* Operations Links */}
          <div className="space-y-3">
            <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#464B71]">
              Operations
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/operations/receipts" className="hover:text-[#168FB3] transition">
                  Inward Receipts
                </Link>
              </li>
              <li>
                <Link href="/operations/deliveries" className="hover:text-[#168FB3] transition">
                  Picking & Packing
                </Link>
              </li>
              <li>
                <Link href="/operations/adjustments" className="hover:text-[#168FB3] transition">
                  Cycle Count Audits
                </Link>
              </li>
              <li>
                <Link href="/operations/move-history" className="hover:text-[#168FB3] transition">
                  Stock Ledger History
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#168FB3] transition">
                  Live Operations Pulse
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Access */}
          <div className="space-y-3">
            <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#464B71]">
              Workspace Access
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/login" className="hover:text-[#168FB3] transition">
                  Operator Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-[#168FB3] transition">
                  Create Workspace
                </Link>
              </li>
              <li>
                <Link href="/settings/audit-log" className="hover:text-[#168FB3] transition">
                  Audit Logs
                </Link>
              </li>
              <li>
                <a href="#roles" className="hover:text-[#168FB3] transition">
                  Role Governance
                </a>
              </li>
              <li>
                <a href="#interactive-demo" className="hover:text-[#168FB3] transition">
                  Interactive Simulator
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[rgba(70,75,113,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#646981]">
          <p>© 2026 StockSense. Enterprise Inventory Management Platform.</p>
          <div className="flex items-center gap-4">
            <span>High Concurrency Tested</span>
            <span>·</span>
            <span>Zero Phantom Stock</span>
            <span>·</span>
            <span>PostgreSQL Atomic Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
