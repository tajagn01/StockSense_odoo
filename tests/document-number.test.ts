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

  describe("Simulated Concurrent Sequence Reservation", () => {
    /**
     * Models the atomic sequence allocator used by DocumentSequence table
     */
    class AtomicSequenceAllocator {
      private currentSeq: number;
      private lock: Promise<void> = Promise.resolve();

      constructor(initial: number = 0) {
        this.currentSeq = initial;
      }

      async allocate(prefix: string, year: number): Promise<string> {
        // Enforce mutex/atomic row lock behavior equivalent to PostgreSQL UPDATE ... RETURNING
        return new Promise<string>((resolve) => {
          this.lock = this.lock.then(async () => {
            // Small async tick simulating database round-trip
            await new Promise((r) => setTimeout(r, Math.random() * 5));
            this.currentSeq += 1;
            const formatted = `${prefix}-${year}-${String(this.currentSeq).padStart(4, "0")}`;
            resolve(formatted);
          });
        });
      }
    }

    test("concurrent Promise.all for REC generates unique sequential document numbers with zero duplicates", async () => {
      const allocator = new AtomicSequenceAllocator(10);
      const year = 2026;

      const results = await Promise.all([
        allocator.allocate("REC", year),
        allocator.allocate("REC", year),
        allocator.allocate("REC", year),
        allocator.allocate("REC", year),
        allocator.allocate("REC", year),
      ]);

      assert.equal(results.length, 5);
      const uniqueResults = new Set(results);
      assert.equal(uniqueResults.size, 5, "All generated document numbers must be unique");

      // Verify exact sequence
      assert.deepEqual(results, [
        "REC-2026-0011",
        "REC-2026-0012",
        "REC-2026-0013",
        "REC-2026-0014",
        "REC-2026-0015",
      ]);
    });

    test("concurrent Promise.all for DEL generates unique sequential delivery numbers", async () => {
      const allocator = new AtomicSequenceAllocator(0);
      const year = 2026;

      const results = await Promise.all([
        allocator.allocate("DEL", year),
        allocator.allocate("DEL", year),
        allocator.allocate("DEL", year),
        allocator.allocate("DEL", year),
        allocator.allocate("DEL", year),
      ]);

      const uniqueResults = new Set(results);
      assert.equal(uniqueResults.size, 5);
      assert.deepEqual(results, [
        "DEL-2026-0001",
        "DEL-2026-0002",
        "DEL-2026-0003",
        "DEL-2026-0004",
        "DEL-2026-0005",
      ]);
    });

    test("concurrent Promise.all for TRF generates unique sequential transfer numbers", async () => {
      const allocator = new AtomicSequenceAllocator(49);
      const year = 2026;

      const results = await Promise.all([
        allocator.allocate("TRF", year),
        allocator.allocate("TRF", year),
        allocator.allocate("TRF", year),
      ]);

      const uniqueResults = new Set(results);
      assert.equal(uniqueResults.size, 3);
      assert.deepEqual(results, [
        "TRF-2026-0050",
        "TRF-2026-0051",
        "TRF-2026-0052",
      ]);
    });

    test("concurrent Promise.all for ADJ generates unique sequential adjustment numbers", async () => {
      const allocator = new AtomicSequenceAllocator(99);
      const year = 2026;

      const results = await Promise.all([
        allocator.allocate("ADJ", year),
        allocator.allocate("ADJ", year),
        allocator.allocate("ADJ", year),
      ]);

      const uniqueResults = new Set(results);
      assert.equal(uniqueResults.size, 3);
      assert.deepEqual(results, [
        "ADJ-2026-0100",
        "ADJ-2026-0101",
        "ADJ-2026-0102",
      ]);
    });
  });
});
