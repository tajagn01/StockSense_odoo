import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Delivery 4-Stage State Machine Workflow", () => {
  const validTransitions: Record<string, string[]> = {
    DRAFT: ["READY"],
    READY: ["PICKING"],
    PICKING: ["PACKED"],
    PACKED: ["DONE"],
    DONE: [],
  };

  function canTransition(current: string, next: string): boolean {
    return validTransitions[current]?.includes(next) ?? false;
  }

  test("allows transition from READY to PICKING", () => {
    assert.equal(canTransition("READY", "PICKING"), true);
  });

  test("allows transition from PICKING to PACKED", () => {
    assert.equal(canTransition("PICKING", "PACKED"), true);
  });

  test("allows transition from PACKED to DONE", () => {
    assert.equal(canTransition("PACKED", "DONE"), true);
  });

  test("rejects invalid skipping transition directly from READY to DONE", () => {
    assert.equal(canTransition("READY", "DONE"), false);
  });

  test("rejects transition backwards from DONE to PICKING", () => {
    assert.equal(canTransition("DONE", "PICKING"), false);
  });

  test("verifies all ordered quantities must be picked before packing", () => {
    const items = [
      { quantity: 20, pickedQuantity: 20 },
      { quantity: 10, pickedQuantity: 8 }, // incomplete pick
    ];

    const isFullyPicked = items.every((i) => i.pickedQuantity >= i.quantity);
    assert.equal(isFullyPicked, false);
  });

  test("approves packing when all items are completely picked", () => {
    const items = [
      { quantity: 20, pickedQuantity: 20 },
      { quantity: 10, pickedQuantity: 10 },
    ];

    const isFullyPicked = items.every((i) => i.pickedQuantity >= i.quantity);
    assert.equal(isFullyPicked, true);
  });
});
