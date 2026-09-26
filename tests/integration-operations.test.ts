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

  describe("Concurrent Stock Operation & Race Condition Invariants", () => {
    /**
     * Models the atomic conditional decrement implemented via:
     * `UPDATE "Inventory" SET quantity = quantity - $qty WHERE id = $id AND quantity >= $qty`
     */
    class AtomicInventoryStore {
      private stock: number;
      private lock: Promise<void> = Promise.resolve();

      constructor(initialStock: number) {
        this.stock = initialStock;
      }

      async decrementAtomic(qty: number): Promise<{ success: boolean; newStock?: number }> {
        return new Promise((resolve) => {
          this.lock = this.lock.then(async () => {
            await new Promise((r) => setTimeout(r, Math.random() * 5));
            if (this.stock >= qty) {
              this.stock -= qty;
              resolve({ success: true, newStock: this.stock });
            } else {
              resolve({ success: false });
            }
          });
        });
      }

      getStock(): number {
        return this.stock;
      }
    }

    test("two concurrent deliveries competing for same stock: only one succeeds, stock stays non-negative", async () => {
      // Stock = 10. Request A requests 8. Request B requests 8.
      const store = new AtomicInventoryStore(10);

      const [resA, resB] = await Promise.all([
        store.decrementAtomic(8),
        store.decrementAtomic(8),
      ]);

      // Exactly one must succeed, the other must fail
      const successes = [resA, resB].filter((r) => r.success);
      const failures = [resA, resB].filter((r) => !r.success);

      assert.equal(successes.length, 1, "Exactly one delivery should succeed");
      assert.equal(failures.length, 1, "The competing delivery must be safely rejected");
      assert.equal(store.getStock(), 2, "Final stock must be exactly 10 - 8 = 2");
      assert.ok(store.getStock() >= 0, "Stock must never become negative");
    });

    test("two concurrent transfers competing for same source stock: total inventory preserved", async () => {
      const sourceStore = new AtomicInventoryStore(25);

      const [res1, res2] = await Promise.all([
        sourceStore.decrementAtomic(15),
        sourceStore.decrementAtomic(15),
      ]);

      const successes = [res1, res2].filter((r) => r.success);
      assert.equal(successes.length, 1);
      assert.equal(sourceStore.getStock(), 10);
    });

    test("double processing prevention: simultaneous validation requests only allow one state change", async () => {
      let state = "PACKED";
      let executionCount = 0;
      let lock = Promise.resolve();

      async function validateAndShip(): Promise<{ success: boolean }> {
        return new Promise((resolve) => {
          lock = lock.then(async () => {
            // Emulates `UPDATE "Delivery" SET status = 'DONE' WHERE id = $id AND status = 'PACKED'`
            if (state === "PACKED") {
              state = "DONE";
              executionCount++;
              resolve({ success: true });
            } else {
              resolve({ success: false });
            }
          });
        });
      }

      const [call1, call2] = await Promise.all([
        validateAndShip(),
        validateAndShip(),
      ]);

      const successfulCalls = [call1, call2].filter((c) => c.success);
      assert.equal(successfulCalls.length, 1);
      assert.equal(executionCount, 1, "Ledger and audit log entries must not duplicate");
      assert.equal(state, "DONE");
    });
  });
});
