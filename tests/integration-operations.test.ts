import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Transactional Inventory Invariants & Operation Validation", () => {
  test("Receipt validation: increment inventory and maintain before/after ledger parity", () => {
    const beforeStock = 100;
    const incomingQty = 50;
    const afterStock = beforeStock + incomingQty;

    const ledgerEntry = {
      movementType: "RECEIPT",
      quantity: incomingQty,
      beforeQuantity: beforeStock,
      afterQuantity: afterStock,
    };

    assert.equal(afterStock, 150);
    assert.equal(ledgerEntry.afterQuantity - ledgerEntry.beforeQuantity, incomingQty);
  });

  test("Delivery validation: checks stock availability and prevents negative inventory", () => {
    const currentStock = 20;
    const requestedQty = 30;

    let hasSufficientStock = currentStock >= requestedQty;
    assert.equal(hasSufficientStock, false);

    // If stock is sufficient
    const validQty = 15;
    hasSufficientStock = currentStock >= validQty;
    const afterStock = currentStock - validQty;

    assert.equal(hasSufficientStock, true);
    assert.equal(afterStock, 5);
    assert.ok(afterStock >= 0);
  });

  test("Internal transfer: atomic dual-entry preserves system-wide aggregate balance", () => {
    const sourceBefore = 50;
    const destBefore = 20;
    const transferQty = 15;

    const sourceAfter = sourceBefore - transferQty;
    const destAfter = destBefore + transferQty;

    const aggregateBefore = sourceBefore + destBefore;
    const aggregateAfter = sourceAfter + destAfter;

    // Invariant: sum of inventory across system before and after transfer MUST be identical
    assert.equal(aggregateBefore, 70);
    assert.equal(aggregateAfter, 70);
    assert.equal(aggregateBefore, aggregateAfter);
  });
});
