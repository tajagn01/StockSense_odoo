import { prisma } from "@/lib/prisma";

export type DocPrefix = "REC" | "DEL" | "TRF" | "ADJ";

/**
 * Generates a human-readable, concurrency-safe document number:
 * Format: [PREFIX]-[YYYY]-[XXXX] (e.g., REC-2026-0001)
 */
export async function generateDocumentNumber(
  prefix: DocPrefix,
  tx?: any
): Promise<string> {
  const db = tx || prisma;
  const year = new Date().getFullYear();
  const searchPrefix = `${prefix}-${year}-`;

  let latestRecord: { docNo: string } | null = null;

  if (prefix === "REC") {
    const item = await db.receipt.findFirst({
      where: { receiptNo: { startsWith: searchPrefix } },
      orderBy: { receiptNo: "desc" },
      select: { receiptNo: true },
    });
    if (item) latestRecord = { docNo: item.receiptNo };
  } else if (prefix === "DEL") {
    const item = await db.delivery.findFirst({
      where: { deliveryNo: { startsWith: searchPrefix } },
      orderBy: { deliveryNo: "desc" },
      select: { deliveryNo: true },
    });
    if (item) latestRecord = { docNo: item.deliveryNo };
  } else if (prefix === "TRF") {
    const item = await db.transfer.findFirst({
      where: { transferNo: { startsWith: searchPrefix } },
      orderBy: { transferNo: "desc" },
      select: { transferNo: true },
    });
    if (item) latestRecord = { docNo: item.transferNo };
  } else if (prefix === "ADJ") {
    const item = await db.stockAdjustment.findFirst({
      where: { adjustmentNo: { startsWith: searchPrefix } },
      orderBy: { adjustmentNo: "desc" },
      select: { adjustmentNo: true },
    });
    if (item) latestRecord = { docNo: item.adjustmentNo };
  }

  let nextSequence = 1;
  if (latestRecord?.docNo) {
    const parts = latestRecord.docNo.split("-");
    const numPart = parseInt(parts[2], 10);
    if (!isNaN(numPart)) {
      nextSequence = numPart + 1;
    }
  }

  // Format with minimum 4 digits
  return `${prefix}-${year}-${String(nextSequence).padStart(4, "0")}`;
}
