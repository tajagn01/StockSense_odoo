import { UserRole } from "@prisma/client";

/**
 * Centralized Role-Based Access Control (RBAC) Permission Matrix for StockSense.
 * 
 * Matrix Overview:
 * - ADMIN: Full access across all system entities, configurations, and operations.
 * - INVENTORY_MANAGER: Full operational management (Products, Categories, Reorder Rules, Warehouses, Operations, Ledger, Adjustments).
 * - WAREHOUSE_STAFF: Permitted shopfloor operational execution (Receipts, Transfers, Picking/Packing deliveries).
 *   Staff are explicitly restricted from administrative configurations, stock adjustments, product updates, and final delivery dispatch.
 */

// --- Products & Catalog Permissions ---
export function canManageProducts(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.INVENTORY_MANAGER;
}

export function canManageCategories(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.INVENTORY_MANAGER;
}

export function canManageReorderRules(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.INVENTORY_MANAGER;
}

// --- Facility & Warehouse Permissions ---
export function canManageWarehouses(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.INVENTORY_MANAGER;
}

// --- Receipts & Inward Operations Permissions ---
export function canCreateReceipt(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.INVENTORY_MANAGER || role === UserRole.WAREHOUSE_STAFF;
}

export function canValidateReceipt(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.INVENTORY_MANAGER || role === UserRole.WAREHOUSE_STAFF;
}

// --- Deliveries & Outward Operations Permissions ---
export function canCreateDelivery(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.INVENTORY_MANAGER;
}

export function canPickDelivery(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.INVENTORY_MANAGER || role === UserRole.WAREHOUSE_STAFF;
}

export function canPackDelivery(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.INVENTORY_MANAGER || role === UserRole.WAREHOUSE_STAFF;
}

export function canValidateDelivery(role: UserRole): boolean {
  // Final shipping validation and outward inventory deduction is restricted to Managers & Admins
  return role === UserRole.ADMIN || role === UserRole.INVENTORY_MANAGER;
}

// --- Internal Transfers Permissions ---
export function canCreateTransfer(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.INVENTORY_MANAGER || role === UserRole.WAREHOUSE_STAFF;
}

export function canValidateTransfer(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.INVENTORY_MANAGER || role === UserRole.WAREHOUSE_STAFF;
}

export function canTransferStock(role: UserRole): boolean {
  return canCreateTransfer(role) || canValidateTransfer(role);
}

// --- Stock Adjustments & Physical Count Permissions ---
export function canAdjustStock(role: UserRole): boolean {
  // Direct stock ledger override / reconciliation is restricted to Managers & Admins
  return role === UserRole.ADMIN || role === UserRole.INVENTORY_MANAGER;
}

// --- Audit & System Logs Permissions ---
export function canViewAuditLogs(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.INVENTORY_MANAGER;
}

export function canManageUsers(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}

/**
 * Asserts that the role satisfies a permission condition; throws an Error if unauthorized.
 */
export function assertPermission(
  role: UserRole,
  checkFn: (role: UserRole) => boolean,
  actionDescription: string = "perform this operation"
): void {
  if (!checkFn(role)) {
    throw new Error(`Unauthorized: Role '${role}' does not have permission to ${actionDescription}.`);
  }
}
