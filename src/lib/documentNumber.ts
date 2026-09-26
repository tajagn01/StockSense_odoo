import { prisma } from "@/lib/prisma";

export type DocPrefix = "REC" | "DEL" | "TRF" | "ADJ";

/**
 * Concurrency-safe sequence reservation helper.
 * Uses atomic sequence table increments with PostgreSQL row locks to guarantee unique sequential numbers.
 */
async function reserveSequence(db: any, prefix: DocPrefix, year: number): Promise<number> {
  const existingSeq = await db.documentSequence.findUnique({
    where: {
      prefix_year: {
        prefix,
        year,
      },
    },
  });

  if (!existingSeq) {
    // Find current maximum document number from existing records to avoid collisions with seeded or existing data
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

    const startNumber = currentMax + 1;

    try {
      await db.documentSequence.create({
        data: {
          prefix,
          year,
          nextNumber: startNumber + 1,
        },
      });
      return startNumber;
    } catch {
      // If a concurrent request created the record at the same instant, continue to atomic update
    }
  }

  // Atomic update: increment sequence counter and return updated state
  const updated = await db.documentSequence.update({
    where: {
      prefix_year: {
        prefix,
        year,
      },
    },
    data: {
      nextNumber: {
        increment: 1,
      },
    },
    select: {
      nextNumber: true,
    },
  });

  return updated.nextNumber - 1;
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

  let allocatedSeq: number;
  if (tx) {
    allocatedSeq = await reserveSequence(db, prefix, year);
  } else {
    allocatedSeq = await prisma.$transaction(async (innerTx) => {
      return await reserveSequence(innerTx, prefix, year);
    });
  }

  return `${prefix}-${year}-${String(allocatedSeq).padStart(4, "0")}`;
}
