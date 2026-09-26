import { Prisma } from "@prisma/client";

/**
 * Result of an atomic inventory mutation.
 */
export interface InventoryMutationResult {
  inventoryId: string;
  beforeQuantity: number;
  afterQuantity: number;
  quantityDelta: number;
}

/**
 * Result of an inventory adjustment under row-level lock.
 */
export interface InventoryAdjustmentResult {
  inventoryId: string;
  systemQuantity: number;
  physicalQuantity: number;
  difference: number;
  beforeQuantity: number;
  afterQuantity: number;
}

/**
 * Atomically increments inventory for a product at a specific location using PostgreSQL RETURNING.
 * Guarantees exact beforeQuantity and afterQuantity calculations for StockLedger integrity under concurrency.
 */
export async function incrementInventoryAtomic(
  tx: Prisma.TransactionClient,
  {
    productId,
    warehouseId,
    locationId,
    quantity,
  }: {
    productId: string;
    warehouseId: string;
    locationId: string;
    quantity: number;
  }
): Promise<InventoryMutationResult> {
  if (quantity <= 0) {
    throw new Error("Increment quantity must be a positive integer.");
  }

  // Attempt atomic update with RETURNING
  const updatedRows = await tx.$queryRaw<{ id: string; quantity: number }[]>`
    UPDATE "Inventory"
    SET "quantity" = "quantity" + ${quantity}, "updatedAt" = NOW()
    WHERE "productId" = ${productId} AND "locationId" = ${locationId}
    RETURNING "id", "quantity";
  `;

  if (updatedRows.length > 0) {
    const afterQuantity = updatedRows[0].quantity;
    const beforeQuantity = afterQuantity - quantity;
    return {
      inventoryId: updatedRows[0].id,
      beforeQuantity,
      afterQuantity,
      quantityDelta: quantity,
    };
  }

  // If no row existed, insert with ON CONFLICT DO UPDATE to handle concurrent creations safely
  const newId = `inv_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
  const upsertRows = await tx.$queryRaw<{ id: string; quantity: number }[]>`
    INSERT INTO "Inventory" ("id", "productId", "warehouseId", "locationId", "quantity", "updatedAt")
    VALUES (${newId}, ${productId}, ${warehouseId}, ${locationId}, ${quantity}, NOW())
    ON CONFLICT ("productId", "locationId")
    DO UPDATE SET "quantity" = "Inventory"."quantity" + ${quantity}, "updatedAt" = NOW()
    RETURNING "id", "quantity";
  `;

  const afterQuantity = upsertRows[0].quantity;
  const beforeQuantity = afterQuantity - quantity;
  return {
    inventoryId: upsertRows[0].id,
    beforeQuantity,
    afterQuantity,
    quantityDelta: quantity,
  };
}

/**
 * Atomically decrements inventory for a product at a specific location.
 * Uses conditional WHERE quantity >= $quantity and RETURNING to guarantee non-negative stock
 * and precise before/after ledger quantities under concurrent workloads.
 */
export async function decrementInventoryAtomic(
  tx: Prisma.TransactionClient,
  {
    productId,
    locationId,
    quantity,
    productName,
    uom = "units",
  }: {
    productId: string;
    locationId: string;
    quantity: number;
    productName?: string;
    uom?: string;
  }
): Promise<InventoryMutationResult> {
  if (quantity <= 0) {
    throw new Error("Decrement quantity must be a positive integer.");
  }

  // Atomic conditional update returning resulting quantity
  const updatedRows = await tx.$queryRaw<{ id: string; quantity: number }[]>`
    UPDATE "Inventory"
    SET "quantity" = "quantity" - ${quantity}, "updatedAt" = NOW()
    WHERE "productId" = ${productId} 
      AND "locationId" = ${locationId} 
      AND "quantity" >= ${quantity}
    RETURNING "id", "quantity";
  `;

  if (updatedRows.length === 0) {
    const nameStr = productName ? `'${productName}'` : "product";
    const uomStr = uom ? ` ${uom}` : "";
    throw new Error(
      `Insufficient stock for ${nameStr}. Required: ${quantity}${uomStr}. The requested quantity exceeds available stock.`
    );
  }

  const afterQuantity = updatedRows[0].quantity;
  const beforeQuantity = afterQuantity + quantity;

  return {
    inventoryId: updatedRows[0].id,
    beforeQuantity,
    afterQuantity,
    quantityDelta: -quantity,
  };
}

/**
 * Reconciles inventory count under an exclusive PostgreSQL row lock (SELECT ... FOR UPDATE).
 * Prevents race conditions and guarantees that concurrent inventory movements are not blindly overwritten.
 */
export async function reconcileInventoryWithLock(
  tx: Prisma.TransactionClient,
  {
    productId,
    warehouseId,
    locationId,
    physicalQuantity,
  }: {
    productId: string;
    warehouseId: string;
    locationId: string;
    physicalQuantity: number;
  }
): Promise<InventoryAdjustmentResult> {
  if (physicalQuantity < 0) {
    throw new Error("Physical count cannot be negative.");
  }

  // Acquire row-level lock on inventory record
  const lockedRows = await tx.$queryRaw<{ id: string; quantity: number }[]>`
    SELECT "id", "quantity"
    FROM "Inventory"
    WHERE "productId" = ${productId} AND "locationId" = ${locationId}
    FOR UPDATE;
  `;

  let systemQuantity = 0;
  let inventoryId: string;

  if (lockedRows.length > 0) {
    inventoryId = lockedRows[0].id;
    systemQuantity = lockedRows[0].quantity;

    await tx.$executeRaw`
      UPDATE "Inventory"
      SET "quantity" = ${physicalQuantity}, "updatedAt" = NOW()
      WHERE "id" = ${inventoryId};
    `;
  } else {
    inventoryId = `inv_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    await tx.$executeRaw`
      INSERT INTO "Inventory" ("id", "productId", "warehouseId", "locationId", "quantity", "updatedAt")
      VALUES (${inventoryId}, ${productId}, ${warehouseId}, ${locationId}, ${physicalQuantity}, NOW())
      ON CONFLICT ("productId", "locationId")
      DO UPDATE SET "quantity" = ${physicalQuantity}, "updatedAt" = NOW();
    `;
  }

  const difference = physicalQuantity - systemQuantity;

  return {
    inventoryId,
    systemQuantity,
    physicalQuantity,
    difference,
    beforeQuantity: systemQuantity,
    afterQuantity: physicalQuantity,
  };
}
