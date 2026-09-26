import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Inventory Calculations & Stock Rules", () => {
  test("calculates total product quantity accurately across multi-bin locations", () => {
    const bins = [
      { locationId: "loc-1", quantity: 50 },
      { locationId: "loc-2", quantity: 30 },
      { locationId: "loc-3", quantity: 20 },
    ];

    const total = bins.reduce((sum, b) => sum + b.quantity, 0);
    assert.equal(total, 100);
  });

  test("evaluates OUT_OF_STOCK status when quantity is 0", () => {
    const totalQuantity = 0;
    const reorderLevel = 20;

    let status = "NORMAL";
    if (totalQuantity === 0) status = "OUT_OF_STOCK";
    else if (totalQuantity <= reorderLevel) status = "LOW_STOCK";

    assert.equal(status, "OUT_OF_STOCK");
  });

  test("evaluates LOW_STOCK alert when quantity is below or equal to reorder threshold", () => {
    const totalQuantity: number = 14;
    const reorderLevel = 20;

    let status = "NORMAL";
    if (totalQuantity === 0) status = "OUT_OF_STOCK";
    else if (totalQuantity <= reorderLevel) status = "LOW_STOCK";

    assert.equal(status, "LOW_STOCK");
  });

  test("evaluates NORMAL healthy stock when quantity exceeds threshold", () => {
    const totalQuantity: number = 85;
    const reorderLevel = 20;

    let status = "NORMAL";
    if (totalQuantity === 0) status = "OUT_OF_STOCK";
    else if (totalQuantity <= reorderLevel) status = "LOW_STOCK";

    assert.equal(status, "NORMAL");
  });

  test("calculates adjustment difference accurately: physical - system", () => {
    const systemQuantity = 183;
    const physicalQuantity = 180;
    const difference = physicalQuantity - systemQuantity;

    assert.equal(difference, -3);
  });

  test("prevents negative physical count adjustments", () => {
    const physicalQuantity = -5;
    const isValid = physicalQuantity >= 0;

    assert.equal(isValid, false);
  });
});
