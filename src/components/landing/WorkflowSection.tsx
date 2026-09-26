"use client";

import { useState } from "react";
import {
  ArrowDownToLine,
  Warehouse,
  ArrowLeftRight,
  Truck,
  SlidersHorizontal,
  User,
  History,
  CheckCircle2,
} from "lucide-react";

export function WorkflowSection() {
  const [selectedStep, setSelectedStep] = useState(0);

  const steps = [
    {
      num: "01",
      name: "RECEIVE",
      title: "Inwarding & Dock Inspection",
      icon: ArrowDownToLine,
      role: "Warehouse Staff",
      records: "Receipt REC-YYYY-XXXX & StockLedger (+Δ)",
      whatHappens:
        "Vendor shipment arrives at dock. Staff inspects quantities against PO, enters discrepancy notes, and triggers single-click receipt validation. Inventory increments atomically upon confirmation.",
    },
    {
      num: "02",
      name: "STORE",
      title: "Directed Bin Putaway",
      icon: Warehouse,
      role: "Warehouse Staff",
      records: "Location Allocation (Compound Product/Location Index)",
      whatHappens:
        "Materials are routed to designated zone, aisle, and bin shelves. System updates location allocation without duplicating records or creating orphan inventory.",
    },
    {
      num: "03",
      name: "MOVE",
      title: "Internal Relocation",
      icon: ArrowLeftRight,
      role: "Warehouse Staff / Manager",
      records: "Dual-Entry StockLedger (TRANSFER_OUT & TRANSFER_IN)",
      whatHappens:
        "Stock is moved between zones or facilities. The source location is conditionally decremented while the destination is incremented in one atomic transaction, preserving system-wide quantity balance.",
    },
    {
      num: "04",
      name: "FULFILL",
      title: "Picking, Packing & Shipping",
      icon: Truck,
      role: "Warehouse Staff & Manager",
      records: "Delivery DEL-YYYY-XXXX & StockLedger (-Δ)",
      whatHappens:
        "Orders transition through READY → PICKING → PACKED → DONE. Stock availability is verified prior to picking, boxed and labeled during packing, and conditionally decremented upon dispatch.",
    },
    {
      num: "05",
      name: "RECONCILE",
      title: "Cycle Counts & Audits",
      icon: SlidersHorizontal,
      role: "Inventory Manager / Admin",
      records: "StockAdjustment ADJ-YYYY-XXXX & Reason Codes",
      whatHappens:
        "Periodic physical counts reconcile discrepancies under exclusive PostgreSQL row-level locks, computing variance without corrupting concurrent shipments.",
    },
  ];

  return (
    <section id="workflow" className="py-20 md:py-28 bg-[#F2F2ED] border-t border-[rgba(70,75,113,0.10)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-[#168FB3] font-bold">
            End-To-End Operational Flow
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#464B71] tracking-tight">
            How inventory moves from arrival to dispatch.
          </h2>
          <p className="text-sm sm:text-base text-[#646981] leading-relaxed">
            A transparent, auditable 5-step operational lifecycle keeping your shopfloor aligned and your database mathematically consistent.
          </p>
        </div>

        {/* Stepper Tabs: Desktop Horizontal / Mobile Wrap */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isSelected = selectedStep === idx;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setSelectedStep(idx)}
                className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                  isSelected
                    ? "bg-[#464B71] text-white border-[#464B71] shadow-sm"
                    : "bg-[#FFFFFF] text-[#464B71] border-[rgba(70,75,113,0.12)] hover:border-[#168FB3]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`font-mono text-xs font-bold ${
                      isSelected ? "text-[#73D0C3]" : "text-[#168FB3]"
                    }`}
                  >
                    {s.num}
                  </span>
                  <Icon
                    className={`h-4 w-4 ${isSelected ? "text-[#73D0C3]" : "text-[#646981]"}`}
                  />
                </div>
                <div className="font-bold text-xs uppercase tracking-wide">{s.name}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Step Expanded Detail Card */}
        <div className="rounded-2xl border border-[rgba(70,75,113,0.14)] bg-[#FFFFFF] p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#168FB3] font-bold">
                <span>Phase {steps[selectedStep].num}</span>
                <span>·</span>
                <span>{steps[selectedStep].name}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#464B71]">
                {steps[selectedStep].title}
              </h3>

              <p className="text-sm text-[#646981] leading-relaxed">
                {steps[selectedStep].whatHappens}
              </p>
            </div>

            <div className="lg:col-span-5 space-y-3.5 bg-[#F2F2ED]/60 p-5 rounded-xl border border-[rgba(70,75,113,0.08)]">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#464B71] uppercase tracking-wider">
                  <User className="h-3.5 w-3.5 text-[#168FB3]" />
                  Responsible Operator
                </div>
                <div className="text-xs font-semibold text-[#464B71] pl-5">
                  {steps[selectedStep].role}
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-[rgba(70,75,113,0.06)]">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#464B71] uppercase tracking-wider">
                  <History className="h-3.5 w-3.5 text-[#168FB3]" />
                  What StockSense Records
                </div>
                <div className="text-xs font-mono text-[#168FB3] font-semibold pl-5">
                  {steps[selectedStep].records}
                </div>
              </div>

              <div className="pt-2 border-t border-[rgba(70,75,113,0.06)] flex items-center gap-2 text-[11px] text-[#646981]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#73D0C3]" />
                <span>State transition validated on server-side</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
