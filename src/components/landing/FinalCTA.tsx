import Link from "next/link";
import { ArrowRight, Boxes, ShieldCheck, CheckCircle2 } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-20 md:py-28 bg-[#FFFFFF] border-t border-[rgba(70,75,113,0.10)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#464B71] text-white p-8 sm:p-14 lg:p-16 text-center space-y-7 shadow-xl relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#73D0C3]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#168FB3]/15 blur-3xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="inline-flex h-12 w-12 rounded-2xl bg-white/10 items-center justify-center text-[#73D0C3] mx-auto shadow-inner">
            <Boxes className="h-6 w-6" />
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.1]">
              Take control of your inventory.
            </h2>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-xl mx-auto">
              Bring products, warehouses, movements, and fulfillment into one operational system. No spreadsheets. No blind spots.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#73D0C3] hover:bg-[#5ec4b5] text-[#464B71] font-bold text-xs sm:text-sm transition shadow-sm hover:shadow"
            >
              <span>Start using StockSense</span>
              <ArrowRight className="h-4 w-4 text-[#464B71]" />
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 font-semibold text-xs sm:text-sm transition"
            >
              <span>Sign in to workspace</span>
            </Link>
          </div>

          {/* Bottom Indicators */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-white/70">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
              PostgreSQL Atomic Ledger
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#73D0C3]" />
              Role-Based Access Guard
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
              Zero Phantom Inventory
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
