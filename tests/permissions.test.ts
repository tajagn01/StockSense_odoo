import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { UserRole } from "@prisma/client";
import {
  canManageProducts,
  canManageWarehouses,
  canManageCategories,
  canManageReorderRules,
  canViewAuditLogs,
  canManageUsers,
  canCreateReceipt,
  canValidateReceipt,
  canCreateDelivery,
  canPickDelivery,
  canPackDelivery,
  canValidateDelivery,
  canCreateTransfer,
  canValidateTransfer,
  canAdjustStock,
  assertPermission,
} from "../src/lib/permissions";

describe("Role-Based Access Control (RBAC) Verification", () => {
  const admin = UserRole.ADMIN;
  const manager = UserRole.INVENTORY_MANAGER;
  const staff = UserRole.WAREHOUSE_STAFF;

  describe("ADMIN Permissions", () => {
    test("ADMIN has full permissions across all management and operational domains", () => {
      assert.equal(canManageProducts(admin), true);
      assert.equal(canManageWarehouses(admin), true);
      assert.equal(canManageCategories(admin), true);
      assert.equal(canManageReorderRules(admin), true);
      assert.equal(canViewAuditLogs(admin), true);
      assert.equal(canManageUsers(admin), true);
      assert.equal(canCreateReceipt(admin), true);
      assert.equal(canValidateReceipt(admin), true);
      assert.equal(canCreateDelivery(admin), true);
      assert.equal(canPickDelivery(admin), true);
      assert.equal(canPackDelivery(admin), true);
      assert.equal(canValidateDelivery(admin), true);
      assert.equal(canCreateTransfer(admin), true);
      assert.equal(canValidateTransfer(admin), true);
      assert.equal(canAdjustStock(admin), true);
    });
  });

  describe("INVENTORY_MANAGER Permissions", () => {
    test("INVENTORY_MANAGER has operational management permissions", () => {
      assert.equal(canManageProducts(manager), true);
      assert.equal(canManageWarehouses(manager), true);
      assert.equal(canManageCategories(manager), true);
      assert.equal(canManageReorderRules(manager), true);
      assert.equal(canViewAuditLogs(manager), true);
      assert.equal(canCreateReceipt(manager), true);
      assert.equal(canValidateReceipt(manager), true);
      assert.equal(canCreateDelivery(manager), true);
      assert.equal(canPickDelivery(manager), true);
      assert.equal(canPackDelivery(manager), true);
      assert.equal(canValidateDelivery(manager), true);
      assert.equal(canCreateTransfer(manager), true);
      assert.equal(canValidateTransfer(manager), true);
      assert.equal(canAdjustStock(manager), true);
    });

    test("INVENTORY_MANAGER cannot perform user administration", () => {
      assert.equal(canManageUsers(manager), false);
    });
  });

  describe("WAREHOUSE_STAFF Restrictions & Execution Permitted", () => {
    test("WAREHOUSE_STAFF is blocked from administrative and management configuration", () => {
      assert.equal(canManageProducts(staff), false);
      assert.equal(canManageWarehouses(staff), false);
      assert.equal(canManageCategories(staff), false);
      assert.equal(canManageReorderRules(staff), false);
      assert.equal(canViewAuditLogs(staff), false);
      assert.equal(canManageUsers(staff), false);
    });

    test("WAREHOUSE_STAFF is blocked from critical stock adjustments and final delivery dispatch", () => {
      assert.equal(canAdjustStock(staff), false);
      assert.equal(canValidateDelivery(staff), false);
      assert.equal(canCreateDelivery(staff), false);
    });

    test("WAREHOUSE_STAFF is permitted for shopfloor operational execution", () => {
      assert.equal(canCreateReceipt(staff), true);
      assert.equal(canValidateReceipt(staff), true);
      assert.equal(canPickDelivery(staff), true);
      assert.equal(canPackDelivery(staff), true);
      assert.equal(canCreateTransfer(staff), true);
      assert.equal(canValidateTransfer(staff), true);
    });
  });

  describe("Permission Assertion Guard", () => {
    test("assertPermission throws Unauthorized error for disallowed role", () => {
      assert.throws(
        () => assertPermission(staff, canAdjustStock, "perform adjustments"),
        /Unauthorized: Role 'WAREHOUSE_STAFF' does not have permission to perform adjustments/
      );
    });

    test("assertPermission passes cleanly for authorized role", () => {
      assert.doesNotThrow(() => assertPermission(admin, canAdjustStock, "perform adjustments"));
      assert.doesNotThrow(() => assertPermission(manager, canAdjustStock, "perform adjustments"));
    });
  });
});
