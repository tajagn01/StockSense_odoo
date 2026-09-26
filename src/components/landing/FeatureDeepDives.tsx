import {
  Boxes,
  Truck,
  Warehouse,
  History,
  CheckCircle2,
} from "lucide-react";

export function FeatureDeepDives() {
  return (
    <section id="operations" className="py-20 md:py-28 bg-[#F2F2ED] space-y-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {/* Feature 1: Inventory Control */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] text-[11px] font-mono text-[#168FB3] font-bold">
              <Boxes className="h-3.5 w-3.5" />
              Inventory Control
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#464B71] tracking-tight">
              Know exactly what you have.
            </h3>
            <p className="text-sm sm:text-base text-[#646981] leading-relaxed">
              Maintain an accurate master catalog with SKU codes, unit of measure designations, and discrete storage location balances. Automatic reorder rules notify management the instant stock hits safe buffer thresholds.
            </p>
            <div className="space-y-2.5 pt-2 text-xs text-[#464B71]">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                Multi-bin availability with compound uniqueness guarantees
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                Automated reorder point evaluation and low-stock alerts
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                Zero phantom inventory through atomic database locks
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[rgba(70,75,113,0.06)] pb-3 text-xs">
                <span className="font-bold text-[#464B71]">Product Stock & Threshold Matrix</span>
                <span className="text-[10px] text-[#168FB3] font-mono font-semibold">Live Balances</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#F2F2ED]/50 border border-[rgba(70,75,113,0.06)] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#464B71]">Industrial Safety Gloves</div>
                    <div className="text-[10px] text-[#646981] font-mono">SKU-GLV-01 · Min Reorder: 50</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[#464B71] text-sm">240</span>
                    <div className="text-[10px] text-[#73D0C3] font-bold">Optimal Stock</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F2F2ED]/50 border border-[rgba(70,75,113,0.06)] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#464B71]">High-Visibility Vests</div>
                    <div className="text-[10px] text-[#646981] font-mono">SKU-VST-04 · Min Reorder: 25</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[#168FB3] text-sm">18</span>
                    <div className="text-[10px] text-[#168FB3] font-bold">Reorder Alert</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F2F2ED]/50 border border-[rgba(70,75,113,0.06)] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#464B71]">Copper Coil Spool 50m</div>
                    <div className="text-[10px] font-mono text-[#646981] font-mono">SKU-COP-12 · Min Reorder: 30</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[#464B71] text-sm">115</span>
                    <div className="text-[10px] text-[#73D0C3] font-bold">Optimal Stock</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Fulfillment Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 lg:order-2 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] text-[11px] font-mono text-[#168FB3] font-bold">
              <Truck className="h-3.5 w-3.5" />
              Fulfillment Pipeline
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#464B71] tracking-tight">
              From order to shipment, without the guesswork.
            </h3>
            <p className="text-sm sm:text-base text-[#646981] leading-relaxed">
              Fulfillment operations progress through four server-validated stages. Stock is checked for physical availability before picking, verified during packing, and conditionally decremented upon final shipment validation.
            </p>
            <div className="space-y-2.5 pt-2 text-xs text-[#464B71]">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                Strict state machine progression: READY → PICKING → PACKED → DONE
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                Atomic conditional decrements prevent overselling and negative inventory
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                Full rollback protection on validation interruption or failure
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 lg:order-1">
            <div className="rounded-2xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-[rgba(70,75,113,0.06)] pb-3 text-xs">
                <span className="font-bold text-[#464B71]">Fulfillment Pipeline Progression</span>
                <span className="font-mono text-[10px] text-[#646981]">Delivery DEL-2026-0081</span>
              </div>

              {/* Visual 4-Stage Stepper Cards */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)]">
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-full bg-[#464B71] text-white flex items-center justify-center text-[10px] font-bold">1</span>
                    <div>
                      <div className="font-bold text-[#464B71]">READY FOR PICKING</div>
                      <div className="text-[10px] text-[#646981]">Order staged with stock reserved</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#73D0C3] font-bold">Verified</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)]">
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-full bg-[#464B71] text-white flex items-center justify-center text-[10px] font-bold">2</span>
                    <div>
                      <div className="font-bold text-[#464B71]">IN PICKING</div>
                      <div className="text-[10px] text-[#646981]">Warehouse staff gathers line items from bins</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#73D0C3] font-bold">Verified</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)]">
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-full bg-[#464B71] text-white flex items-center justify-center text-[10px] font-bold">3</span>
                    <div>
                      <div className="font-bold text-[#464B71]">PACKED & LABELED</div>
                      <div className="text-[10px] text-[#646981]">Items boxed and sealed for dispatch</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#73D0C3] font-bold">Verified</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#73D0C3]/20 border border-[#73D0C3]/40">
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-full bg-[#168FB3] text-white flex items-center justify-center text-[10px] font-bold">4</span>
                    <div>
                      <div className="font-bold text-[#464B71]">DISPATCHED (DONE)</div>
                      <div className="text-[10px] text-[#646981]">Atomic inventory decrement & ledger logged</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#168FB3] font-bold">Complete ✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3: Multi-Warehouse Operations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] text-[11px] font-mono text-[#168FB3] font-bold">
              <Warehouse className="h-3.5 w-3.5" />
              Warehouse Operations
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#464B71] tracking-tight">
              Every location. One source of truth.
            </h3>
            <p className="text-sm sm:text-base text-[#646981] leading-relaxed">
              Model your physical facilities with strict hierarchical clarity. Map physical buildings to designated zones, aisles, and storage bins so every team member knows exactly where stock is positioned.
            </p>
            <div className="space-y-2.5 pt-2 text-xs text-[#464B71]">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                Warehouse → Location → Product → Quantity hierarchy
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                Multi-facility transfers with dual-entry ledger balance
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                Active/Archived facility status guards preventing obsolete putaways
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[rgba(70,75,113,0.06)] pb-3 text-xs">
                <span className="font-bold text-[#464B71]">Storage Location Hierarchy</span>
                <span className="text-[10px] text-[#646981]">WH-CENTRAL Tree</span>
              </div>

              {/* Hierarchy Tree Visualization */}
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)]">
                  <div className="flex items-center justify-between font-bold text-[#464B71]">
                    <span>Central Logistics Hub (WH-CENTRAL)</span>
                    <span className="font-mono text-[10px] text-[#168FB3]">Primary Warehouse</span>
                  </div>
                  <div className="mt-2.5 pl-4 border-l-2 border-[rgba(70,75,113,0.15)] space-y-2 text-[11px]">
                    <div className="flex items-center justify-between text-[#646981]">
                      <span>└ Zone A · Inbound Staging & PPE Bins</span>
                      <span className="font-mono text-[#464B71] font-semibold">380 units</span>
                    </div>
                    <div className="flex items-center justify-between text-[#646981]">
                      <span>└ Zone B · Bulk Equipment & Furniture Racks</span>
                      <span className="font-mono text-[#464B71] font-semibold">244 units</span>
                    </div>
                    <div className="flex items-center justify-between text-[#646981]">
                      <span>└ Zone C · Raw Materials & Spools</span>
                      <span className="font-mono text-[#464B71] font-semibold">200 units</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.08)]">
                  <div className="flex items-center justify-between font-bold text-[#464B71]">
                    <span>East Distribution Depot (WH-EAST)</span>
                    <span className="font-mono text-[10px] text-[#646981]">Secondary Facility</span>
                  </div>
                  <div className="mt-2.5 pl-4 border-l-2 border-[rgba(70,75,113,0.15)] space-y-2 text-[11px]">
                    <div className="flex items-center justify-between text-[#646981]">
                      <span>└ Zone B · Outbound Regional Dispatch</span>
                      <span className="font-mono text-[#464B71] font-semibold">424 units</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 4: Stock Movement Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 lg:order-2 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] text-[11px] font-mono text-[#168FB3] font-bold">
              <History className="h-3.5 w-3.5" />
              Traceability & Auditability
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#464B71] tracking-tight">
              Every movement leaves a trail.
            </h3>
            <p className="text-sm sm:text-base text-[#646981] leading-relaxed">
              StockSense maintains an immutable chronological stock ledger. Every single increment, decrement, and transfer records exact beforeQuantity and afterQuantity snapshots returned directly from the PostgreSQL engine.
            </p>
            <div className="space-y-2.5 pt-2 text-xs text-[#464B71]">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                Exact mutation tracking derived from atomic RETURNING queries
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                Permanent reference tracking to Receipts, Deliveries, and Transfers
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#73D0C3]" />
                Attribution linking every inventory modification to the responsible user
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 lg:order-1">
            <div className="rounded-2xl border border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[rgba(70,75,113,0.06)] pb-3 text-xs">
                <span className="font-bold text-[#464B71]">Chronological StockLedger Feed</span>
                <span className="font-mono text-[10px] text-[#646981]">Append-Only Log</span>
              </div>

              {/* Table Ledger Mockup */}
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.06)] flex items-center justify-between">
                  <div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#73D0C3]/25 text-[#168FB3] mr-2">RECEIPT</span>
                    <span className="text-[#464B71] font-semibold">REC-2026-0042</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#168FB3] font-bold">+50</span>
                    <span className="text-[10px] text-[#646981] ml-2">(240 → 290)</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.06)] flex items-center justify-between">
                  <div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#168FB3]/20 text-[#168FB3] mr-2">TRANSFER_OUT</span>
                    <span className="text-[#464B71] font-semibold">TRF-2026-0019</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#646981] font-bold">-40</span>
                    <span className="text-[10px] text-[#646981] ml-2">(290 → 250)</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.06)] flex items-center justify-between">
                  <div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#73D0C3]/25 text-[#168FB3] mr-2">TRANSFER_IN</span>
                    <span className="text-[#464B71] font-semibold">TRF-2026-0019</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#168FB3] font-bold">+40</span>
                    <span className="text-[10px] text-[#646981] ml-2">(0 → 40)</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.06)] flex items-center justify-between">
                  <div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#464B71]/15 text-[#464B71] mr-2">DELIVERY</span>
                    <span className="text-[#464B71] font-semibold">DEL-2026-0081</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#646981] font-bold">-25</span>
                    <span className="text-[10px] text-[#646981] ml-2">(250 → 225)</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#F2F2ED]/60 border border-[rgba(70,75,113,0.06)] flex items-center justify-between">
                  <div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#464B71]/25 text-[#464B71] mr-2">ADJUSTMENT</span>
                    <span className="text-[#464B71] font-semibold">ADJ-2026-0005</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#168FB3] font-bold">+5</span>
                    <span className="text-[10px] text-[#646981] ml-2">(225 → 230)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
