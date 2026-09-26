import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma";
import { UserRole } from "@prisma/client";
import { setMockUserForTest, SessionUser } from "../src/lib/auth";
import { generateDocumentNumber } from "../src/lib/documentNumber";
import { validateDeliveryAction, createDeliveryAction } from "../src/app/actions/deliveryActions";
import { validateReceiptAction, createReceiptAction } from "../src/app/actions/receiptActions";
import { validateTransferAction } from "../src/app/actions/transferActions";
import { createAdjustmentAction } from "../src/app/actions/adjustmentActions";
import { signupAction } from "../src/app/actions/authActions";
import { createProductAction } from "../src/app/actions/productActions";
import { createWarehouseAction } from "../src/app/actions/warehouseActions";

// Ensure test environment is active
(process.env as Record<string, string | undefined>).NODE_ENV = "test";

describe("Live PostgreSQL Database Concurrency & Integrity Suite", () => {
  let testAdminUser: SessionUser;
  let testStaffUser: SessionUser;
  let testWarehouseId: string;
  let testLocationIdA: string;
  let testLocationIdB: string;
  let testCategoryId: string;
  let testProductId: string;
  let testCustomerId: string;
  let testSupplierId: string;

  before(async () => {
    // 1. Seed or retrieve test user
    const dbAdmin = await prisma.user.upsert({
      where: { email: "test-concurrency-admin@stocksense.test" },
      update: { role: UserRole.ADMIN },
      create: {
        name: "Test Concurrency Admin",
        email: "test-concurrency-admin@stocksense.test",
        role: UserRole.ADMIN,
      },
    });

    const dbStaff = await prisma.user.upsert({
      where: { email: "test-concurrency-staff@stocksense.test" },
      update: { role: UserRole.WAREHOUSE_STAFF },
      create: {
        name: "Test Concurrency Staff",
        email: "test-concurrency-staff@stocksense.test",
        role: UserRole.WAREHOUSE_STAFF,
      },
    });

    testAdminUser = {
      id: dbAdmin.id,
      name: dbAdmin.name,
      email: dbAdmin.email,
      role: dbAdmin.role,
    };

    testStaffUser = {
      id: dbStaff.id,
      name: dbStaff.name,
      email: dbStaff.email,
      role: dbStaff.role,
    };

    // 2. Set up test warehouse & locations
    const wh = await prisma.warehouse.upsert({
      where: { code: "WH-CONC-TEST" },
      update: {},
      create: {
        name: "Concurrency Test Warehouse",
        code: "WH-CONC-TEST",
      },
    });
    testWarehouseId = wh.id;

    const locA = await prisma.location.upsert({
      where: { warehouseId_code: { warehouseId: wh.id, code: "LOC-CONC-A" } },
      update: {},
      create: {
        name: "Location A",
        code: "LOC-CONC-A",
        warehouseId: wh.id,
      },
    });
    testLocationIdA = locA.id;

    const locB = await prisma.location.upsert({
      where: { warehouseId_code: { warehouseId: wh.id, code: "LOC-CONC-B" } },
      update: {},
      create: {
        name: "Location B",
        code: "LOC-CONC-B",
        warehouseId: wh.id,
      },
    });
    testLocationIdB = locB.id;

    // 3. Category & Product
    const cat = await prisma.category.upsert({
      where: { name: "Concurrency Category" },
      update: {},
      create: { name: "Concurrency Category" },
    });
    testCategoryId = cat.id;

    const prod = await prisma.product.upsert({
      where: { sku: "SKU-CONC-TEST" },
      update: {},
      create: {
        name: "Concurrency Test Widget",
        sku: "SKU-CONC-TEST",
        categoryId: cat.id,
        uom: "Units",
      },
    });
    testProductId = prod.id;

    // 4. Customer & Supplier
    let cust = await prisma.customer.findFirst({ where: { name: "Concurrency Customer" } });
    if (!cust) {
      cust = await prisma.customer.create({ data: { name: "Concurrency Customer" } });
    }
    testCustomerId = cust.id;

    let supp = await prisma.supplier.findFirst({ where: { name: "Concurrency Supplier" } });
    if (!supp) {
      supp = await prisma.supplier.create({ data: { name: "Concurrency Supplier" } });
    }
    testSupplierId = supp.id;
  });

  after(async () => {
    setMockUserForTest(null);
    // Cleanup temporary documents created by tests
    try {
      await prisma.deliveryItem.deleteMany({ where: { product: { sku: "SKU-CONC-TEST" } } });
      await prisma.delivery.deleteMany({ where: { customerId: testCustomerId } });
      await prisma.receiptItem.deleteMany({ where: { product: { sku: "SKU-CONC-TEST" } } });
      await prisma.receipt.deleteMany({ where: { supplierId: testSupplierId } });
      await prisma.transferItem.deleteMany({ where: { product: { sku: "SKU-CONC-TEST" } } });
      await prisma.transfer.deleteMany({ where: { sourceWarehouseId: testWarehouseId } });
      await prisma.stockLedger.deleteMany({ where: { productId: testProductId } });
      await prisma.inventory.deleteMany({ where: { productId: testProductId } });
    } catch {
      // Ignored during tear down
    }
  });

  describe("Real Database Document Number Concurrency (50 Parallel Requests)", () => {
    test("50 simultaneous Promise.all calls produce 50 unique sequential numbers in PostgreSQL", async () => {
      const year = new Date().getFullYear();
      const pattern = new RegExp(`^REC-${year}-\\d{4}$`);

      // Fire 50 simultaneous parallel requests directly against Neon PostgreSQL
      const results = await Promise.all(
        Array.from({ length: 50 }, () => generateDocumentNumber("REC"))
      );

      assert.equal(results.length, 50);
      const uniqueSet = new Set(results);
      assert.equal(uniqueSet.size, 50, "Every single generated document number must be unique");

      // Verify format
      for (const docNo of results) {
        assert.match(docNo, pattern);
      }
    });

    test("simultaneous calls for DEL, TRF, and ADJ produce unique numbers without collision", async () => {
      const [delNumbers, trfNumbers, adjNumbers] = await Promise.all([
        Promise.all(Array.from({ length: 10 }, () => generateDocumentNumber("DEL"))),
        Promise.all(Array.from({ length: 10 }, () => generateDocumentNumber("TRF"))),
        Promise.all(Array.from({ length: 10 }, () => generateDocumentNumber("ADJ"))),
      ]);

      assert.equal(new Set(delNumbers).size, 10);
      assert.equal(new Set(trfNumbers).size, 10);
      assert.equal(new Set(adjNumbers).size, 10);
    });
  });

  describe("Real Database Delivery Stock Competition Concurrency", () => {
    test("two concurrent deliveries requesting 8 units from 10 stock: exactly 1 succeeds, stock ends at 2, stock >= 0", async () => {
      setMockUserForTest(testAdminUser);

      // Set initial stock = 10
      await prisma.inventory.upsert({
        where: {
          productId_locationId: {
            productId: testProductId,
            locationId: testLocationIdA,
          },
        },
        update: { quantity: 10 },
        create: {
          productId: testProductId,
          locationId: testLocationIdA,
          warehouseId: testWarehouseId,
          quantity: 10,
        },
      });

      // Create two PACKED deliveries for 8 units each
      const delNoA = await generateDocumentNumber("DEL");
      const delA = await prisma.delivery.create({
        data: {
          deliveryNo: delNoA,
          customerId: testCustomerId,
          warehouseId: testWarehouseId,
          status: "PACKED",
          createdById: testAdminUser.id,
          items: {
            create: [
              {
                productId: testProductId,
                locationId: testLocationIdA,
                quantity: 8,
                pickedQuantity: 8,
                packedQuantity: 8,
              },
            ],
          },
        },
      });

      const delNoB = await generateDocumentNumber("DEL");
      const delB = await prisma.delivery.create({
        data: {
          deliveryNo: delNoB,
          customerId: testCustomerId,
          warehouseId: testWarehouseId,
          status: "PACKED",
          createdById: testAdminUser.id,
          items: {
            create: [
              {
                productId: testProductId,
                locationId: testLocationIdA,
                quantity: 8,
                pickedQuantity: 8,
                packedQuantity: 8,
              },
            ],
          },
        },
      });

      // Concurrently execute both validations against the live database
      const [resA, resB] = await Promise.all([
        validateDeliveryAction(delA.id),
        validateDeliveryAction(delB.id),
      ]);

      const successes = [resA, resB].filter((r) => r.success);
      const failures = [resA, resB].filter((r) => !r.success);

      assert.equal(successes.length, 1, "Exactly one delivery should succeed");
      assert.equal(failures.length, 1, "The competing delivery must be rejected");

      // Verify stock in PostgreSQL
      const finalInv = await prisma.inventory.findUnique({
        where: {
          productId_locationId: {
            productId: testProductId,
            locationId: testLocationIdA,
          },
        },
      });

      assert.equal(finalInv!.quantity, 2, "Final inventory must be exactly 10 - 8 = 2");
      assert.ok(finalInv!.quantity >= 0, "Inventory must never drop below zero");

      // Verify exactly 1 ledger movement
      const ledgerMovements = await prisma.stockLedger.findMany({
        where: {
          referenceId: { in: [delNoA, delNoB] },
          movementType: "DELIVERY",
        },
      });
      assert.equal(ledgerMovements.length, 1);
      assert.equal(ledgerMovements[0].beforeQuantity, 10);
      assert.equal(ledgerMovements[0].afterQuantity, 2);
      assert.equal(ledgerMovements[0].quantity, -8);
    });
  });

  describe("Real Database Double Processing Prevention", () => {
    test("multiple concurrent validation calls for the same delivery: exactly 1 succeeds, no duplicate ledger/audit", async () => {
      setMockUserForTest(testAdminUser);

      // Stock has 2 units remaining
      const delNo = await generateDocumentNumber("DEL");
      const delivery = await prisma.delivery.create({
        data: {
          deliveryNo: delNo,
          customerId: testCustomerId,
          warehouseId: testWarehouseId,
          status: "PACKED",
          createdById: testAdminUser.id,
          items: {
            create: [
              {
                productId: testProductId,
                locationId: testLocationIdA,
                quantity: 2,
                pickedQuantity: 2,
                packedQuantity: 2,
              },
            ],
          },
        },
      });

      // 3 concurrent attempts to validate the exact same delivery
      const results = await Promise.all([
        validateDeliveryAction(delivery.id),
        validateDeliveryAction(delivery.id),
        validateDeliveryAction(delivery.id),
      ]);

      const successes = results.filter((r) => r.success);
      const failures = results.filter((r) => !r.success);

      assert.equal(successes.length, 1, "Only one call may succeed in completing the delivery");
      assert.equal(failures.length, 2, "Duplicate calls must be rejected");

      // Verify single ledger entry
      const ledgers = await prisma.stockLedger.findMany({
        where: { referenceId: delNo },
      });
      assert.equal(ledgers.length, 1);

      // Verify single audit entry
      const audits = await prisma.auditLog.findMany({
        where: {
          entityId: delivery.id,
          action: "VALIDATE_DELIVERY",
        },
      });
      assert.equal(audits.length, 1);
    });
  });

  describe("Real Database Transfer Concurrency", () => {
    test("two concurrent transfers competing for source stock: total inventory preserved", async () => {
      setMockUserForTest(testAdminUser);

      // Set source stock = 25, destination stock = 0
      await prisma.inventory.upsert({
        where: {
          productId_locationId: {
            productId: testProductId,
            locationId: testLocationIdA,
          },
        },
        update: { quantity: 25 },
        create: {
          productId: testProductId,
          locationId: testLocationIdA,
          warehouseId: testWarehouseId,
          quantity: 25,
        },
      });

      await prisma.inventory.upsert({
        where: {
          productId_locationId: {
            productId: testProductId,
            locationId: testLocationIdB,
          },
        },
        update: { quantity: 0 },
        create: {
          productId: testProductId,
          locationId: testLocationIdB,
          warehouseId: testWarehouseId,
          quantity: 0,
        },
      });

      // Transfer A: 15 units. Transfer B: 15 units.
      const trfNoA = await generateDocumentNumber("TRF");
      const trfA = await prisma.transfer.create({
        data: {
          transferNo: trfNoA,
          sourceWarehouseId: testWarehouseId,
          sourceLocationId: testLocationIdA,
          destinationWarehouseId: testWarehouseId,
          destinationLocationId: testLocationIdB,
          status: "READY",
          createdById: testAdminUser.id,
          items: {
            create: [{ productId: testProductId, quantity: 15 }],
          },
        },
      });

      const trfNoB = await generateDocumentNumber("TRF");
      const trfB = await prisma.transfer.create({
        data: {
          transferNo: trfNoB,
          sourceWarehouseId: testWarehouseId,
          sourceLocationId: testLocationIdA,
          destinationWarehouseId: testWarehouseId,
          destinationLocationId: testLocationIdB,
          status: "READY",
          createdById: testAdminUser.id,
          items: {
            create: [{ productId: testProductId, quantity: 15 }],
          },
        },
      });

      const [resA, resB] = await Promise.all([
        validateTransferAction(trfA.id),
        validateTransferAction(trfB.id),
      ]);

      const successes = [resA, resB].filter((r) => r.success);
      const failures = [resA, resB].filter((r) => !r.success);

      assert.equal(successes.length, 1);
      assert.equal(failures.length, 1);

      const [invA, invB] = await Promise.all([
        prisma.inventory.findUnique({
          where: { productId_locationId: { productId: testProductId, locationId: testLocationIdA } },
        }),
        prisma.inventory.findUnique({
          where: { productId_locationId: { productId: testProductId, locationId: testLocationIdB } },
        }),
      ]);

      assert.equal(invA!.quantity, 10, "Source inventory after one transfer must be 25 - 15 = 10");
      assert.equal(invB!.quantity, 15, "Destination inventory after one transfer must be 15");
      assert.equal(invA!.quantity + invB!.quantity, 25, "System-wide inventory balance must be strictly conserved");
    });
  });

  describe("Real Database Concurrent Receipts (Chain Continuity)", () => {
    test("concurrent receipts (+10 and +20 from starting 100): final stock is 130 and ledger forms continuous chain", async () => {
      setMockUserForTest(testAdminUser);

      // Start with 100 units at Location A
      await prisma.inventory.upsert({
        where: {
          productId_locationId: {
            productId: testProductId,
            locationId: testLocationIdA,
          },
        },
        update: { quantity: 100 },
        create: {
          productId: testProductId,
          locationId: testLocationIdA,
          warehouseId: testWarehouseId,
          quantity: 100,
        },
      });

      const recNo1 = await generateDocumentNumber("REC");
      const rec1 = await prisma.receipt.create({
        data: {
          receiptNo: recNo1,
          supplierId: testSupplierId,
          warehouseId: testWarehouseId,
          status: "READY",
          createdById: testAdminUser.id,
          items: {
            create: [{ productId: testProductId, locationId: testLocationIdA, quantity: 10 }],
          },
        },
      });

      const recNo2 = await generateDocumentNumber("REC");
      const rec2 = await prisma.receipt.create({
        data: {
          receiptNo: recNo2,
          supplierId: testSupplierId,
          warehouseId: testWarehouseId,
          status: "READY",
          createdById: testAdminUser.id,
          items: {
            create: [{ productId: testProductId, locationId: testLocationIdA, quantity: 20 }],
          },
        },
      });

      const [res1, res2] = await Promise.all([
        validateReceiptAction(rec1.id),
        validateReceiptAction(rec2.id),
      ]);

      assert.equal(res1.success, true);
      assert.equal(res2.success, true);

      const finalInv = await prisma.inventory.findUnique({
        where: {
          productId_locationId: {
            productId: testProductId,
            locationId: testLocationIdA,
          },
        },
      });

      assert.equal(finalInv!.quantity, 130, "100 + 10 + 20 must equal 130");

      // Verify ledger entries form a continuous mutation chain
      const ledgers = await prisma.stockLedger.findMany({
        where: { referenceId: { in: [recNo1, recNo2] } },
        orderBy: { afterQuantity: "asc" },
      });

      assert.equal(ledgers.length, 2);
      // First transaction must be 100 -> 110 (or 100 -> 120)
      // Second transaction must start from the first afterQuantity and end at 130
      assert.equal(ledgers[0].beforeQuantity, 100);
      assert.equal(ledgers[1].afterQuantity, 130);
      assert.equal(ledgers[0].afterQuantity, ledgers[1].beforeQuantity, "Ledger must form an unbroken continuous sequence");
    });
  });

  describe("Real Database Adjustment Concurrency & Row Locking", () => {
    test("adjustment competing with concurrent receipt movement produces valid serialization without lost updates", async () => {
      setMockUserForTest(testAdminUser);

      // Start with 50 units
      await prisma.inventory.upsert({
        where: {
          productId_locationId: {
            productId: testProductId,
            locationId: testLocationIdA,
          },
        },
        update: { quantity: 50 },
        create: {
          productId: testProductId,
          locationId: testLocationIdA,
          warehouseId: testWarehouseId,
          quantity: 50,
        },
      });

      // Prepare a receipt for +10
      const recNo = await generateDocumentNumber("REC");
      const receipt = await prisma.receipt.create({
        data: {
          receiptNo: recNo,
          supplierId: testSupplierId,
          warehouseId: testWarehouseId,
          status: "READY",
          createdById: testAdminUser.id,
          items: {
            create: [{ productId: testProductId, locationId: testLocationIdA, quantity: 10 }],
          },
        },
      });

      // Prepare an adjustment setting physical count to 70
      const adjForm = new FormData();
      adjForm.append("productId", testProductId);
      adjForm.append("locationId", testLocationIdA);
      adjForm.append("physicalQuantity", "70");
      adjForm.append("reason", "COUNTING_ERROR");
      adjForm.append("notes", "Concurrency test reconciliation");

      // Concurrently execute Receipt validation and Stock Adjustment
      const [resRec, resAdj] = await Promise.all([
        validateReceiptAction(receipt.id),
        createAdjustmentAction(adjForm),
      ]);

      assert.equal(resRec.success, true);
      assert.equal(resAdj.success, true);

      // Verify the final inventory matches one of the two valid serializations:
      // Case 1 (Receipt first: 50 -> 60, then Adjustment reconciles 60 -> 70): final = 70
      // Case 2 (Adjustment first: 50 -> 70, then Receipt increments 70 -> 80): final = 80
      const finalInv = await prisma.inventory.findUnique({
        where: {
          productId_locationId: {
            productId: testProductId,
            locationId: testLocationIdA,
          },
        },
      });

      assert.ok(
        finalInv!.quantity === 70 || finalInv!.quantity === 80,
        `Final inventory must be 70 or 80 depending on serialization order, got ${finalInv!.quantity}`
      );

      // Retrieve adjustment record and verify systemQuantity + difference === physicalQuantity
      const adjustmentRecord = await prisma.stockAdjustment.findFirst({
        where: { adjustmentNo: resAdj.adjustmentNo },
      });
      assert.ok(adjustmentRecord);
      assert.equal(adjustmentRecord.physicalQuantity, 70);
      assert.equal(
        adjustmentRecord.systemQuantity + adjustmentRecord.difference,
        adjustmentRecord.physicalQuantity,
        "Reconciled difference must match physical snapshot"
      );

      // Verify adjustment ledger entry matches the exact mutation
      const adjLedger = await prisma.stockLedger.findFirst({
        where: { referenceId: resAdj.adjustmentNo, movementType: "ADJUSTMENT" },
      });
      assert.ok(adjLedger);
      assert.equal(adjLedger.beforeQuantity + adjLedger.quantity, adjLedger.afterQuantity);
      assert.equal(adjLedger.afterQuantity, 70);
    });
  });

  describe("Public Signup Role Safety", () => {
    test("public signup unconditionally assigns WAREHOUSE_STAFF even with admin/manager email", async () => {
      const emailAdmin = `test-auto-admin-${Date.now()}@example.com`;
      const formAdmin = new FormData();
      formAdmin.append("name", "Auto Admin Test");
      formAdmin.append("email", emailAdmin);
      formAdmin.append("password", "SecurePassword123!");
      formAdmin.append("confirmPassword", "SecurePassword123!");

      const resAdmin = await signupAction(formAdmin);
      assert.equal(resAdmin.success, true);

      const userCreated = await prisma.user.findUnique({ where: { email: emailAdmin } });
      assert.equal(userCreated?.role, UserRole.WAREHOUSE_STAFF, "Must be WAREHOUSE_STAFF, not ADMIN");

      // Cleanup
      await prisma.notification.deleteMany({ where: { userId: userCreated!.id } });
      await prisma.user.delete({ where: { id: userCreated!.id } });
    });
  });

  describe("Server Action RBAC Enforcements", () => {
    test("WAREHOUSE_STAFF is blocked from management and unauthorized operations", async () => {
      setMockUserForTest(testStaffUser);

      // Unauthorized delivery validation
      const delRes = await validateDeliveryAction("non-existent-id");
      assert.equal(delRes.success, false);
      assert.match(delRes.error!, /Unauthorized/);

      // Unauthorized product creation
      const formProd = new FormData();
      formProd.append("name", "Hacked Product");
      const prodRes = await createProductAction(formProd);
      assert.equal(prodRes.success, false);
      assert.match(prodRes.error!, /Unauthorized/);

      // Unauthorized warehouse creation
      const formWh = new FormData();
      formWh.append("name", "Hacked Warehouse");
      const whRes = await createWarehouseAction(formWh);
      assert.equal(whRes.success, false);
      assert.match(whRes.error!, /Unauthorized/);

      // Unauthorized stock adjustment
      const formAdj = new FormData();
      formAdj.append("productId", testProductId);
      formAdj.append("locationId", testLocationIdA);
      formAdj.append("physicalQuantity", "100");
      const adjRes = await createAdjustmentAction(formAdj);
      assert.equal(adjRes.success, false);
      assert.match(adjRes.error!, /Unauthorized/);
    });
  });
});
