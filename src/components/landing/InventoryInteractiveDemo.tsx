"use client";

import { useState } from "react";
import {
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  RotateCcw,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface SimulatedLedgerEntry {
  id: string;
  type: "RECEIPT" | "TRANSFER" | "DELIVERY";
  docNo: string;
  delta: number;
  before: number;
  after: number;
  destination?: string;
  time: string;
}

export function InventoryInteractiveDemo() {
  const [stock, setStock] = useState<number>(240);
  const [history, setHistory] = useState<SimulatedLedgerEntry[]>([
    {
      id: "initial",
      type: "RECEIPT",
      docNo: "REC-2026-0001",
      delta: 240,
      before: 0,
      after: 240,
      time: "Initial Inventory",
    },
  ]);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleReceive = () => {
    const before = stock;
    const delta = 50;
    const after = before + delta;
    setStock(after);
    setLastAction("Received +50 units from supplier");
    setHistory((prev) => [
      {
        id: `rec-${Date.now()}`,
        type: "RECEIPT",
        docNo: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        delta: +50,
        before,
        after,
        time: "Just now",
      },
      ...prev,
    ]);
  };

  const handleTransfer = () => {
    if (stock < 40) return;
    const before = stock;
    const delta = -40;
    const after = before + delta;
    setStock(after);
    setLastAction("Transferred 40 units to East Depot (Zone B-02)");
    setHistory((prev) => [
      {
        id: `trf-${Date.now()}`,
        type: "TRANSFER",
        docNo: `TRF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        delta: -40,
        before,
        after,
        destination: "East Depot",
        time: "Just now",
      },
      ...prev,
    ]);
  };

  const handleDeliver = () => {
    if (stock < 25) return;
    const before = stock;
    const delta = -25;
    const after = before + delta;
    setStock(after);
    setLastAction("Dispatched 25 units for customer delivery");
    setHistory((prev) => [
      {
        id: `del-${Date.now()}`,
        type: "DELIVERY",
        docNo: `DEL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        delta: -25,
        before,
        after,
        time: "Just now",
      },
      ...prev,
    ]);
  };

  const handleReset = () => {
    setStock(240);
    setLastAction(null);
    setHistory([
      {
        id: "initial",
        type: "RECEIPT",
        docNo: "REC-2026-0001",
        delta: 240,
        before: 0,
        after: 240,
        time: "Initial Inventory",
      },
    ]);
  };

  return (
    <section id="interactive-demo" className="py-20 md:py-28 bg-[#FFFFFF] border-t border-[rgba(70,75,113,0.10)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#168FB3]/10 text-[#168FB3] text-xs font-mono font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            Live Operation Simulator
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#464B71] tracking-tight">
            See inventory operations in motion.
          </h2>
          <p className="text-sm sm:text-base text-[#646981] leading-relaxed">
            Trigger real-time inventory movements below to observe how StockSense computes atomic balances and appends immutable ledger snapshots.
          </p>
        </div>

        {/* Interactive Workspace Widget */}
        <div className="max-w-5xl mx-auto rounded-2xl border border-[rgba(70,75,113,0.14)] bg-[#F2F2ED]/50 p-5 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Product Card & Action Buttons */}
            <div className="lg:col-span-6 space-y-5">
              <div className="rounded-xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(70,75,113,0.06)]">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-[#464B71] flex items-center justify-center text-white">
                      <Boxes className="h-4.5 w-4.5 text-[#73D0C3]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#464B71]">Industrial Safety Gloves</div>
                      <div className="text-[10px] font-mono text-[#646981]">SKU-GLV-01 · Category: PPE</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-[#73D0C3]/20 text-[#168FB3] font-bold text-[10px]">
                    Active SKU
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.06)]">
                    <div className="text-[10px] text-[#646981]">Facility Location</div>
                    <div className="font-bold text-[#464B71] mt-0.5">Central Hub (Zone A-01)</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.06)]">
                    <div className="text-[10px] text-[#646981]">Safety Reorder Rule</div>
                    <div className="font-bold text-[#464B71] mt-0.5">Min 50 · Replenish 100</div>
                  </div>
                </div>

                {/* Stock Counter Display */}
                <div className="p-5 rounded-xl bg-[#464B71] text-white flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#73D0C3]">
                      On-Hand Inventory
                    </span>
                    <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono mt-1">
                      {stock} <span className="text-sm font-normal text-white/70">Units</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#73D0C3]/20 text-[#73D0C3]">
                      Atomic Lock Active
                    </span>
                    <div className="text-[10px] text-white/70 mt-1 font-mono">Status: Verified</div>
                  </div>
                </div>

                {lastAction && (
                  <div className="p-2.5 rounded-lg bg-[#73D0C3]/20 text-[11px] font-medium text-[#168FB3] flex items-center gap-1.5 animate-in fade-in duration-200">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{lastAction}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons Trigger */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#464B71] uppercase tracking-wider block">
                  Simulate Operational Movements:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleReceive}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#FFFFFF] hover:bg-[#F2F2ED] border border-[rgba(70,75,113,0.14)] text-xs font-bold text-[#168FB3] transition shadow-2xs hover:border-[#168FB3]"
                  >
                    <ArrowDownToLine className="h-3.5 w-3.5" />
                    <span>+50 Receive</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTransfer}
                    disabled={stock < 40}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#FFFFFF] hover:bg-[#F2F2ED] border border-[rgba(70,75,113,0.14)] text-xs font-bold text-[#464B71] transition shadow-2xs hover:border-[#464B71] disabled:opacity-40"
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                    <span>-40 Transfer</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDeliver}
                    disabled={stock < 25}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#FFFFFF] hover:bg-[#F2F2ED] border border-[rgba(70,75,113,0.14)] text-xs font-bold text-[#464B71] transition shadow-2xs hover:border-[#464B71] disabled:opacity-40"
                  >
                    <ArrowUpFromLine className="h-3.5 w-3.5" />
                    <span>-25 Fulfill</span>
                  </button>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#646981] hover:text-[#464B71] transition"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset Simulation
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Live Reactive Ledger Log Feed */}
            <div className="lg:col-span-6 space-y-3">
              <div className="rounded-xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] p-5 shadow-xs h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[rgba(70,75,113,0.06)]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#464B71]">Immutable StockLedger Stream</span>
                      <span className="h-2 w-2 rounded-full bg-[#73D0C3] animate-pulse" />
                    </div>
                    <span className="text-[10px] font-mono text-[#646981]">{history.length} Movements</span>
                  </div>

                  <div className="mt-3 space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg bg-[#F2F2ED]/50 border border-[rgba(70,75,113,0.06)] text-xs font-mono flex items-center justify-between transition animate-in fade-in slide-in-from-top-1 duration-200"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                item.type === "RECEIPT"
                                  ? "bg-[#73D0C3]/30 text-[#168FB3]"
                                  : item.type === "TRANSFER"
                                  ? "bg-[#168FB3]/15 text-[#168FB3]"
                                  : "bg-[#464B71]/15 text-[#464B71]"
                              }`}
                            >
                              {item.type}
                            </span>
                            <span className="text-[#464B71] font-semibold text-[11px]">{item.docNo}</span>
                          </div>
                          <div className="text-[10px] text-[#646981] mt-1">
                            Balance chain: {item.before} → {item.after}
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`font-bold text-xs ${
                              item.delta > 0 ? "text-[#168FB3]" : "text-[#464B71]"
                            }`}
                          >
                            {item.delta > 0 ? `+${item.delta}` : item.delta}
                          </span>
                          <div className="text-[9px] text-[#646981]">{item.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[rgba(70,75,113,0.06)] text-[10px] text-[#646981] flex items-center justify-between font-mono">
                  <span>Guaranteed Concurrency Safety</span>
                  <span className="text-[#73D0C3] font-bold">PostgreSQL Atomic</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
