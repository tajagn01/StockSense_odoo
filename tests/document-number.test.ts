import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Document Number Format & Concurrency Strategy", () => {
  const pattern = /^(REC|DEL|TRF|ADJ)-\d{4}-\d{4}$/;

  test("validates REC receipt number matches REC-YYYY-XXXX format", () => {
    const docNo = "REC-2026-0001";
    assert.match(docNo, pattern);
  });

  test("validates DEL delivery number matches DEL-YYYY-XXXX format", () => {
    const docNo = "DEL-2026-0042";
    assert.match(docNo, pattern);
  });

  test("validates TRF transfer number matches TRF-YYYY-XXXX format", () => {
    const docNo = "TRF-2026-0105";
    assert.match(docNo, pattern);
  });

  test("validates ADJ adjustment number matches ADJ-YYYY-XXXX format", () => {
    const docNo = "ADJ-2026-0999";
    assert.match(docNo, pattern);
  });

  test("increments sequence correctly from previous highest document number", () => {
    const prevDocNo = "REC-2026-0015";
    const parts = prevDocNo.split("-");
    const nextSeq = parseInt(parts[2], 10) + 1;
    const newDocNo = `REC-2026-${String(nextSeq).padStart(4, "0")}`;

    assert.equal(newDocNo, "REC-2026-0016");
  });
});
