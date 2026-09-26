import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { UserRole } from "@prisma/client";
import { hasRole } from "../src/lib/auth";

describe("Role-Based Access Control (RBAC) Verification", () => {
  test("ADMIN has access to all management operations", () => {
    const adminRole = UserRole.ADMIN;
    const isAllowed = hasRole(adminRole, [UserRole.ADMIN, UserRole.INVENTORY_MANAGER]);
    assert.equal(isAllowed, true);
  });

  test("INVENTORY_MANAGER has operational management permissions", () => {
    const managerRole = UserRole.INVENTORY_MANAGER;
    const canManageProducts = hasRole(managerRole, [UserRole.ADMIN, UserRole.INVENTORY_MANAGER]);
    assert.equal(canManageProducts, true);
  });

  test("WAREHOUSE_STAFF is blocked from administrative configuration", () => {
    const staffRole = UserRole.WAREHOUSE_STAFF;
    const canManageWarehouses = hasRole(staffRole, [UserRole.ADMIN, UserRole.INVENTORY_MANAGER]);
    assert.equal(canManageWarehouses, false);
  });

  test("WAREHOUSE_STAFF is permitted for shopfloor operational execution", () => {
    const staffRole = UserRole.WAREHOUSE_STAFF;
    const canExecuteShopfloor = hasRole(staffRole, [
      UserRole.ADMIN,
      UserRole.INVENTORY_MANAGER,
      UserRole.WAREHOUSE_STAFF,
    ]);
    assert.equal(canExecuteShopfloor, true);
  });
});
