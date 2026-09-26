import { prisma } from "@/lib/prisma";

export type DocPrefix = "REC" | "DEL" | "TRF" | "ADJ";

/**
 * Concurrency-safe sequence reservation helper.
 * Uses PostgreSQL atomic UPSERT (INSERT ... ON CONFLICT DO UPDATE) to guarantee
 * unique sequential numbers under high concurrency without transaction aborts.
 */
async function reserveSequence(db: any, prefix: DocPrefix, year: number): Promise<number> {
  const existingSeq = await db.documentSequence.findUnique({
    where: {
      prefix_year: {
        prefix,
        year,
      },
    },
    select: { nextNumber: true },
  });

  let initialNextNumber = 2; // Default if no existing documents: allocates 1, next is 2

  if (!existingSeq) {
    // Find current maximum document number from existing records to avoid collisions with prior data
    const searchPrefix = `${prefix}-${year}-`;
    let currentMax = 0;

    if (prefix === "REC") {
      const item = await db.receipt.findFirst({
        where: { receiptNo: { startsWith: searchPrefix } },
        orderBy: { receiptNo: "desc" },
        select: { receiptNo: true },
      });
      if (item?.receiptNo) {
        const num = parseInt(item.receiptNo.split("-")[2], 10);
        if (!isNaN(num)) currentMax = num;
      }
    } else if (prefix === "DEL") {
      const item = await db.delivery.findFirst({
        where: { deliveryNo: { startsWith: searchPrefix } },
        orderBy: { deliveryNo: "desc" },
        select: { deliveryNo: true },
      });
      if (item?.deliveryNo) {
        const num = parseInt(item.deliveryNo.split("-")[2], 10);
        if (!isNaN(num)) currentMax = num;
      }
    } else if (prefix === "TRF") {
      const item = await db.transfer.findFirst({
        where: { transferNo: { startsWith: searchPrefix } },
        orderBy: { transferNo: "desc" },
        select: { transferNo: true },
      });
      if (item?.transferNo) {
        const num = parseInt(item.transferNo.split("-")[2], 10);
        if (!isNaN(num)) currentMax = num;
      }
    } else if (prefix === "ADJ") {
      const item = await db.stockAdjustment.findFirst({
        where: { adjustmentNo: { startsWith: searchPrefix } },
        orderBy: { adjustmentNo: "desc" },
        select: { adjustmentNo: true },
      });
      if (item?.adjustmentNo) {
        const num = parseInt(item.adjustmentNo.split("-")[2], 10);
        if (!isNaN(num)) currentMax = num;
      }
    }

    initialNextNumber = currentMax + 2; // Allocates currentMax + 1, next will be currentMax + 2
  }

  // Atomic UPSERT: Single native statement with ON CONFLICT DO UPDATE
  const seqRecord = await db.documentSequence.upsert({
    where: {
      prefix_year: {
        prefix,
        year,
      },
    },
    create: {
      prefix,
      year,
      nextNumber: initialNextNumber,
    },
    update: {
      nextNumber: {
        increment: 1,
      },
    },
    select: {
      nextNumber: true,
    },
  });

  return seqRecord.nextNumber - 1;
}

/**
 * Generates a human-readable, concurrency-safe document number:
 * Format: [PREFIX]-[YYYY]-[XXXX] (e.g., REC-2026-0001)
 *
 * Utilizes atomic database sequence allocation to guarantee concurrency safety
 * under parallel request execution.
 */
export async function generateDocumentNumber(
  prefix: DocPrefix,
  tx?: any
): Promise<string> {
  const db = tx || prisma;
  const year = new Date().getFullYear();

  const allocatedSeq = await reserveSequence(db, prefix, year);
  return `${prefix}-${year}-${String(allocatedSeq).padStart(4, "0")}`;
}
