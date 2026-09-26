import { PrismaClient, UserRole, Status, MovementType, AdjustmentReason } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding StockSense database...");

  // 1. Users with hashed passwords (Default password: StockSense123!)
  const defaultPasswordHash = "$2a$10$WqU2j1QO3H2sW3UoI6Gq5eB3G.K/cT/9605uDq47l18Z49lq5O/w2"; // bcrypt hash of "StockSense123!"

  const admin = await prisma.user.upsert({
    where: { email: "admin@stocksense.io" },
    update: { passwordHash: defaultPasswordHash },
    create: {
      name: "StockSense Admin",
      email: "admin@stocksense.io",
      role: UserRole.ADMIN,
      passwordHash: defaultPasswordHash,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@stocksense.io" },
    update: { passwordHash: defaultPasswordHash },
    create: {
      name: "John Manager",
      email: "manager@stocksense.io",
      role: UserRole.INVENTORY_MANAGER,
      passwordHash: defaultPasswordHash,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@stocksense.io" },
    update: { passwordHash: defaultPasswordHash },
    create: {
      name: "Alex Warehouse",
      email: "staff@stocksense.io",
      role: UserRole.WAREHOUSE_STAFF,
      passwordHash: defaultPasswordHash,
    },
  });

  // 2. Warehouses
  const whMain = await prisma.warehouse.upsert({
    where: { code: "WH-MAIN" },
    update: {},
    create: {
      name: "Central Logistics Hub",
      code: "WH-MAIN",
      address: "100 Industrial Parkway, Section 4",
    },
  });

  const whEast = await prisma.warehouse.upsert({
    where: { code: "WH-EAST" },
    update: {},
    create: {
      name: "East Distribution Depot",
      code: "WH-EAST",
      address: "45 Port Road, Terminal 2",
    },
  });

  // 3. Locations
  const locMainStore = await prisma.location.upsert({
    where: { warehouseId_code: { warehouseId: whMain.id, code: "LOC-MAIN-01" } },
    update: {},
    create: {
      name: "Aisle A — Raw Storage",
      code: "LOC-MAIN-01",
      warehouseId: whMain.id,
    },
  });

  const locDock = await prisma.location.upsert({
    where: { warehouseId_code: { warehouseId: whMain.id, code: "LOC-DOCK-01" } },
    update: {},
    create: {
      name: "Inward Receiving Bay",
      code: "LOC-DOCK-01",
      warehouseId: whMain.id,
    },
  });

  const locEastStore = await prisma.location.upsert({
    where: { warehouseId_code: { warehouseId: whEast.id, code: "LOC-EAST-01" } },
    update: {},
    create: {
      name: "Depot Rack B1",
      code: "LOC-EAST-01",
      warehouseId: whEast.id,
    },
  });

  // 4. Categories
  const catRaw = await prisma.category.upsert({
    where: { name: "Raw Materials" },
    update: {},
    create: { name: "Raw Materials", description: "Metals, alloys, raw fabrication stock" },
  });

  const catParts = await prisma.category.upsert({
    where: { name: "Mechanical Parts" },
    update: {},
    create: { name: "Mechanical Parts", description: "Bearings, fasteners, and precision gears" },
  });

  const catElectrical = await prisma.category.upsert({
    where: { name: "Electrical" },
    update: {},
    create: { name: "Electrical", description: "Cables, sensors, connectors" },
  });

  // 5. Products
  const prodSteel = await prisma.product.upsert({
    where: { sku: "STL-ROD-20MM" },
    update: {},
    create: {
      name: "Steel Rods 20mm (Reinforced)",
      sku: "STL-ROD-20MM",
      uom: "kg",
      categoryId: catRaw.id,
      description: "High-tensile structural steel rods for machining",
    },
  });

  const prodBearing = await prisma.product.upsert({
    where: { sku: "BRG-6205-2RS" },
    update: {},
    create: {
      name: "Deep Groove Ball Bearing 6205",
      sku: "BRG-6205-2RS",
      uom: "pcs",
      categoryId: catParts.id,
      description: "Rubber sealed precision ball bearing",
    },
  });

  const prodAlu = await prisma.product.upsert({
    where: { sku: "ALU-CAS-001" },
    update: {},
    create: {
      name: "Aluminum Enclosure Chasis X1",
      sku: "ALU-CAS-001",
      uom: "pcs",
      categoryId: catRaw.id,
      description: "Extruded aluminum casing for controller units",
    },
  });

  const prodWire = await prisma.product.upsert({
    where: { sku: "COP-WIR-25" },
    update: {},
    create: {
      name: "Copper Grounding Wire 2.5mm",
      sku: "COP-WIR-25",
      uom: "m",
      categoryId: catElectrical.id,
      description: "Insulated multi-strand copper grounding cable",
    },
  });

  // 6. Inventory Records
  await prisma.inventory.upsert({
    where: { productId_locationId: { productId: prodSteel.id, locationId: locMainStore.id } },
    update: { quantity: 180 },
    create: {
      productId: prodSteel.id,
      warehouseId: whMain.id,
      locationId: locMainStore.id,
      quantity: 180,
    },
  });

  await prisma.inventory.upsert({
    where: { productId_locationId: { productId: prodBearing.id, locationId: locMainStore.id } },
    update: { quantity: 14 }, // LOW STOCK (reorder level: 30)
    create: {
      productId: prodBearing.id,
      warehouseId: whMain.id,
      locationId: locMainStore.id,
      quantity: 14,
    },
  });

  await prisma.inventory.upsert({
    where: { productId_locationId: { productId: prodAlu.id, locationId: locMainStore.id } },
    update: { quantity: 0 }, // OUT OF STOCK
    create: {
      productId: prodAlu.id,
      warehouseId: whMain.id,
      locationId: locMainStore.id,
      quantity: 0,
    },
  });

  await prisma.inventory.upsert({
    where: { productId_locationId: { productId: prodWire.id, locationId: locEastStore.id } },
    update: { quantity: 420 },
    create: {
      productId: prodWire.id,
      warehouseId: whEast.id,
      locationId: locEastStore.id,
      quantity: 420,
    },
  });

  // 7. Reorder Rules
  await prisma.reorderRule.upsert({
    where: { id: "rule-brg-1" },
    update: {},
    create: {
      id: "rule-brg-1",
      productId: prodBearing.id,
      warehouseId: whMain.id,
      reorderLevel: 30,
      reorderQuantity: 100,
    },
  });

  await prisma.reorderRule.upsert({
    where: { id: "rule-alu-1" },
    update: {},
    create: {
      id: "rule-alu-1",
      productId: prodAlu.id,
      warehouseId: whMain.id,
      reorderLevel: 25,
      reorderQuantity: 50,
    },
  });

  // 8. Suppliers & Customers
  const supplier = await prisma.supplier.upsert({
    where: { id: "sup-acme-1" },
    update: {},
    create: {
      id: "sup-acme-1",
      name: "Acme Industrial Metals",
      email: "orders@acme-metals.com",
      phone: "+1-800-555-0199",
      address: "400 Foundry Way, Cleveland, OH",
    },
  });

  const customer = await prisma.customer.upsert({
    where: { id: "cust-apex-1" },
    update: {},
    create: {
      id: "cust-apex-1",
      name: "Apex Robotics Systems",
      email: "procurement@apexrobotics.io",
      phone: "+1-888-555-0144",
      address: "12 Innovation Dr, Austin, TX",
    },
  });

  // 9. Receipts
  const receipt1 = await prisma.receipt.upsert({
    where: { receiptNo: "REC-2026-001" },
    update: {},
    create: {
      receiptNo: "REC-2026-001",
      supplierId: supplier.id,
      warehouseId: whMain.id,
      status: Status.DONE,
      notes: "Monthly bulk raw steel consignment",
      createdById: manager.id,
      items: {
        create: [
          {
            productId: prodSteel.id,
            locationId: locMainStore.id,
            quantity: 100,
          },
        ],
      },
    },
  });

  await prisma.receipt.upsert({
    where: { receiptNo: "REC-2026-002" },
    update: {},
    create: {
      receiptNo: "REC-2026-002",
      supplierId: supplier.id,
      warehouseId: whMain.id,
      status: Status.READY,
      notes: "Emergency bearing restock shipment",
      createdById: staff.id,
      items: {
        create: [
          {
            productId: prodBearing.id,
            locationId: locDock.id,
            quantity: 50,
          },
        ],
      },
    },
  });

  // 10. Deliveries
  await prisma.delivery.upsert({
    where: { deliveryNo: "DEL-2026-001" },
    update: {},
    create: {
      deliveryNo: "DEL-2026-001",
      customerId: customer.id,
      warehouseId: whMain.id,
      status: Status.DONE,
      notes: "Dispatched order #4491 to Apex line",
      createdById: manager.id,
      items: {
        create: [
          {
            productId: prodSteel.id,
            locationId: locMainStore.id,
            quantity: 20,
            pickedQuantity: 20,
            packedQuantity: 20,
          },
        ],
      },
    },
  });

  await prisma.delivery.upsert({
    where: { deliveryNo: "DEL-2026-002" },
    update: {},
    create: {
      deliveryNo: "DEL-2026-002",
      customerId: customer.id,
      warehouseId: whMain.id,
      status: Status.PICKING,
      notes: "Pending wire spool allocation",
      createdById: staff.id,
      items: {
        create: [
          {
            productId: prodWire.id,
            locationId: locEastStore.id,
            quantity: 40,
            pickedQuantity: 40,
            packedQuantity: 0,
          },
        ],
      },
    },
  });

  // 11. Transfers
  await prisma.transfer.upsert({
    where: { transferNo: "TRF-2026-001" },
    update: {},
    create: {
      transferNo: "TRF-2026-001",
      sourceWarehouseId: whMain.id,
      sourceLocationId: locMainStore.id,
      destinationWarehouseId: whEast.id,
      destinationLocationId: locEastStore.id,
      status: Status.READY,
      notes: "Replenishing East distribution buffer",
      createdById: manager.id,
      items: {
        create: [
          {
            productId: prodSteel.id,
            quantity: 30,
          },
        ],
      },
    },
  });

  // 12. Adjustments
  await prisma.stockAdjustment.upsert({
    where: { adjustmentNo: "ADJ-2026-001" },
    update: {},
    create: {
      adjustmentNo: "ADJ-2026-001",
      productId: prodSteel.id,
      warehouseId: whMain.id,
      locationId: locMainStore.id,
      systemQuantity: 183,
      physicalQuantity: 180,
      difference: -3,
      reason: AdjustmentReason.DAMAGED,
      notes: "3kg bent rod identified during routine cycle count",
      createdById: staff.id,
    },
  });

  // 13. Stock Ledger entries
  await prisma.stockLedger.createMany({
    data: [
      {
        productId: prodSteel.id,
        warehouseId: whMain.id,
        locationId: locMainStore.id,
        movementType: MovementType.RECEIPT,
        quantity: 100,
        beforeQuantity: 0,
        afterQuantity: 100,
        referenceType: "RECEIPT",
        referenceId: receipt1.id,
        reason: "Supplier receipt validation REC-2026-001",
        userId: manager.id,
      },
      {
        productId: prodSteel.id,
        warehouseId: whMain.id,
        locationId: locMainStore.id,
        movementType: MovementType.DELIVERY,
        quantity: -20,
        beforeQuantity: 100,
        afterQuantity: 80,
        referenceType: "DELIVERY",
        referenceId: "DEL-2026-001",
        reason: "Customer delivery DEL-2026-001 to Apex Robotics",
        userId: manager.id,
      },
      {
        productId: prodSteel.id,
        warehouseId: whMain.id,
        locationId: locMainStore.id,
        movementType: MovementType.ADJUSTMENT,
        quantity: -3,
        beforeQuantity: 183,
        afterQuantity: 180,
        referenceType: "ADJUSTMENT",
        referenceId: "ADJ-2026-001",
        reason: "Damaged stock deduction (cycle count)",
        userId: staff.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
