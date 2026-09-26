# StockSense — Inventory Management System
## Complete Product & Technical Specification

> **Source:** StockSense problem statement  
> **Frontend:** Next.js (App Router) + TypeScript  
> **UI:** shadcn/ui + Aceternity UI  
> **Database:** PostgreSQL + Prisma ORM  
> **Goal:** Build a modular, real-time inventory management system that replaces manual registers, Excel sheets, and scattered stock tracking with one centralized application.

---

# 1. Product Overview

StockSense is a centralized Inventory Management System (IMS) for managing products, warehouses, locations, incoming stock, outgoing stock, internal transfers, stock adjustments, and the complete stock ledger.

The system must provide:

- Real-time inventory visibility
- Product and category management
- Multi-warehouse inventory
- Incoming stock/receipts
- Outgoing stock/delivery orders
- Internal stock transfers
- Physical inventory adjustments
- Low-stock alerts
- Search and smart filtering
- Complete stock movement history
- Role-based access
- Auditability of inventory changes
- Responsive desktop/tablet/mobile UI

The source problem statement specifically defines inventory managers and warehouse staff as target users, with authentication, dashboard KPIs, products, receipts, delivery orders, internal transfers, adjustments, move history, warehouse settings, profile, and logout as core areas. fileciteturn0file0L4-L24

---

# 2. Technology Stack

## Required

### Frontend
- Next.js
- App Router
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- Aceternity UI
- Lucide React icons
- React Hook Form
- Zod
- TanStack Query where client-side server-state caching is useful

### Backend
Use Next.js as the application backend:

- Route Handlers
- Server Actions where appropriate
- Server Components for read-heavy pages
- Server-side authorization checks
- Service layer for business logic

### Database
- PostgreSQL
- Prisma ORM

### Authentication
Recommended:
- Auth.js / NextAuth
- Secure session-based authentication
- OTP-based password reset

### Validation
- Zod on the application boundary
- Prisma constraints at the database layer

### Optional but Recommended
- Redis for rate limiting/caching if scale requires it
- Resend/SMTP for email OTPs
- Sentry for error monitoring
- Vercel for deployment
- PostgreSQL provider such as Neon, Supabase, or managed PostgreSQL

---

# 3. Design System

## Design Direction

The application should look like a serious enterprise SaaS product, not a generic dashboard template.

Reference style:
- Clean
- Dense but readable
- Professional
- Minimal
- Strong hierarchy
- Consistent spacing
- Clear data tables
- Fast workflows
- No unnecessary gradients
- No excessive glassmorphism
- Avoid decorative animations that slow down operational workflows

## UI Libraries

### shadcn/ui — Primary UI system

Use shadcn/ui for:
- Button
- Input
- Select
- Combobox
- Dropdown Menu
- Dialog
- Sheet
- Drawer
- Tabs
- Table
- Data Table
- Form
- Checkbox
- Radio Group
- Switch
- Badge
- Alert
- Alert Dialog
- Tooltip
- Popover
- Calendar
- Date Picker
- Command
- Pagination
- Skeleton
- Toast/Sonner
- Breadcrumb
- Sidebar
- Navigation Menu

### Aceternity UI — Use selectively

Use Aceternity UI for:
- Landing page hero
- Empty states
- Subtle background effects
- Product introduction
- Login/signup visual treatment
- Dashboard micro-interactions where useful

Do NOT use Aceternity animations everywhere.

Inventory operations should prioritize speed and clarity over visual effects.

---

# 4. User Roles

## Role 1 — Inventory Manager

Permissions:

- View dashboard
- Create/update products
- Manage categories
- Manage warehouses
- Manage locations
- Create receipts
- Validate receipts
- Create delivery orders
- Validate deliveries
- Create internal transfers
- Validate transfers
- Perform stock adjustments
- View stock ledger
- View inventory reports
- Configure reorder rules
- View alerts
- Manage warehouse settings
- View audit history

## Role 2 — Warehouse Staff

Permissions:

- View assigned inventory
- Search products
- View stock availability
- Perform picking
- Perform packing
- Perform shelving
- Perform counting
- Process assigned receipts
- Process assigned deliveries
- Perform authorized internal transfers
- Perform physical counts
- View movement history

Restrictions should be enforced server-side, not only in the UI.

## Optional Future Role — Admin

Recommended future role:

- Full system access
- User management
- Role management
- Organization settings
- Audit logs
- System configuration

---

# 5. Authentication

## Pages

- `/login`
- `/signup`
- `/forgot-password`
- `/reset-password`
- `/verify-otp`

## Features

### Login
Fields:
- Email
- Password

Actions:
- Login
- Forgot password
- Create account

### Signup
Fields:
- Name
- Email
- Password
- Confirm password

Optional:
- Organization name

### Password Reset
Flow:

1. User enters email
2. Server generates OTP
3. OTP is sent to email
4. User enters OTP
5. OTP is verified
6. User creates new password
7. User is redirected to login

Security:
- OTP expiry
- OTP attempt limit
- Rate limiting
- Hashed passwords
- Secure sessions
- Generic response for unknown emails

---

# 6. Application Layout

After authentication:

```text
┌──────────────────────────────────────────────────────────────┐
│ Topbar                                                       │
│ Search | Notifications | Warehouse | Profile                │
├───────────────┬──────────────────────────────────────────────┤
│ Sidebar       │                                              │
│               │ Main Content                                 │
│ Dashboard     │                                              │
│ Products      │                                              │
│ Operations    │                                              │
│   Receipts    │                                              │
│   Deliveries  │                                              │
│   Transfers   │                                              │
│   Adjustments │                                              │
│   Move History│                                              │
│ Settings      │                                              │
│               │                                              │
│ Profile       │                                              │
│ Logout        │                                              │
└───────────────┴──────────────────────────────────────────────┘
```

The problem statement explicitly specifies Products, Operations, Receipts, Delivery Orders, Inventory Adjustment, Move History, Dashboard, Settings/Warehouse, Profile, and Logout in navigation. fileciteturn0file0L26-L42

---

# 7. Dashboard

Route:

```text
/dashboard
```

## KPI Cards

Required:

1. Total Products in Stock
2. Low Stock Items
3. Out of Stock Items
4. Pending Receipts
5. Pending Deliveries
6. Internal Transfers Scheduled

These KPIs are directly required by the problem statement. fileciteturn0file0L11-L18

## Dashboard Sections

### Inventory Overview
- Total inventory quantity
- Total SKUs
- Low-stock count
- Out-of-stock count
- Inventory by warehouse

### Pending Operations
- Pending receipts
- Pending deliveries
- Pending transfers
- Draft documents

### Recent Activity
Show:
- User
- Action
- Product
- Quantity
- Location
- Date/time

Example:

```text
John received 50 Steel Rods
Warehouse A → Rack A
2 minutes ago
```

### Stock Movement Chart

Show:
- Incoming stock
- Outgoing stock
- Adjustments
- Transfers

Filters:
- Today
- 7 days
- 30 days
- Custom range

### Low Stock Widget

Columns:
- Product
- SKU
- Current stock
- Reorder level
- Location
- Status
- Action

---

# 8. Dashboard Filters

Required filters:

### Document Type
- Receipts
- Delivery
- Internal
- Adjustments

### Status
- Draft
- Waiting
- Ready
- Done
- Canceled

### Warehouse / Location

### Product Category

These filters are explicitly defined in the source problem statement. fileciteturn0file0L19-L24

Additional recommended filters:
- Date range
- Product
- SKU
- Assigned employee

---

# 9. Product Management

Route:

```text
/products
```

## Product List

Columns:

- Product name
- SKU
- Category
- Unit of measure
- Total stock
- Available stock
- Reserved stock
- Reorder level
- Status
- Actions

## Product Creation

Required fields:

- Name
- SKU / Code
- Category
- Unit of Measure
- Initial Stock (optional)

These fields are explicitly required by the source. fileciteturn0file0L43-L50

Recommended additional fields:

- Description
- Barcode
- Reorder level
- Reorder quantity
- Minimum stock
- Maximum stock
- Active/inactive
- Supplier
- Cost price
- Selling/reference price
- Product image

## Product Detail Page

Route:

```text
/products/[productId]
```

Sections:

### Overview
- Product information
- SKU
- Category
- UOM
- Current stock

### Stock by Location

```text
Warehouse A
  Rack A: 50

Warehouse A
  Rack B: 30

Warehouse B
  Rack C: 20
```

### Stock Movement

- Receipts
- Deliveries
- Transfers
- Adjustments

### Reordering

- Reorder level
- Reorder quantity
- Current status

### Activity

Complete product-level activity timeline.

---

# 10. Product Categories

Route:

```text
/products/categories
```

Features:

- Create category
- Edit category
- Delete/archive category
- Search category
- Product count per category

Fields:

```text
name
description
status
```

Prevent deletion if products depend on the category unless the products are reassigned.

---

# 11. Warehouses

Route:

```text
/settings/warehouses
```

Features:

- Create warehouse
- Edit warehouse
- Archive warehouse
- View warehouse stock
- View warehouse locations

Fields:

- Warehouse name
- Code
- Address
- Manager
- Status

---

# 12. Locations

Each warehouse can contain multiple locations.

Example:

```text
Main Warehouse
├── Rack A
├── Rack B
├── Production Floor
└── Dispatch Area
```

Features:

- Create location
- Edit location
- Archive location
- View stock at location
- Transfer stock between locations

Location types:

- Storage
- Production
- Receiving
- Dispatch
- Damaged
- Quarantine

---

# 13. Receipts — Incoming Stock

Route:

```text
/operations/receipts
```

A receipt represents incoming inventory from a supplier/vendor.

The source workflow is:

1. Create receipt
2. Add supplier and products
3. Enter received quantities
4. Validate
5. Automatically increase stock

The source example states that receiving 50 Steel Rods increases stock by 50. fileciteturn0file0L51-L59

## Receipt List

Columns:

- Receipt number
- Supplier
- Warehouse
- Date
- Items
- Status
- Created by
- Actions

Statuses:

```text
DRAFT
WAITING
READY
DONE
CANCELED
```

## Create Receipt

Fields:

- Supplier
- Destination warehouse
- Destination location
- Expected date
- Notes

Line items:

- Product
- SKU
- Ordered quantity
- Received quantity
- UOM

## Receipt Detail

Show:

- Header
- Supplier
- Warehouse
- Products
- Quantities
- Timeline
- Activity
- Validation status

## Validate Receipt

When validated:

```text
Inventory += received quantity
```

Create stock ledger entries.

Use a database transaction so inventory and ledger cannot become inconsistent.

---

# 14. Delivery Orders — Outgoing Stock

Route:

```text
/operations/deliveries
```

Used when stock leaves the warehouse for customer shipment.

The required workflow is:

1. Pick items
2. Pack items
3. Validate
4. Automatically decrease stock

The source explicitly defines this flow. fileciteturn0file0L61-L68

## Delivery Status

```text
DRAFT
WAITING
READY
PICKING
PACKED
DONE
CANCELED
```

## Delivery Creation

Fields:

- Customer/reference
- Source warehouse
- Source location
- Delivery date
- Notes

Items:

- Product
- Required quantity
- Available quantity
- Picked quantity
- Packed quantity

## Stock Validation

Before validating:

```text
availableStock >= requestedQuantity
```

If not:

```text
Insufficient stock
```

Do not allow negative stock unless an explicit future configuration enables it.

---

# 15. Picking

Warehouse staff can process delivery items.

Workflow:

```text
READY
 ↓
PICKING
 ↓
PICKED
 ↓
PACKED
 ↓
DONE
```

Features:

- Pick list
- Product location
- Required quantity
- Picked quantity
- Barcode/SKU search
- Mark item picked
- Partial picking handling

---

# 16. Packing

Packing screen:

- Delivery number
- Product
- Picked quantity
- Packed quantity
- Package/reference
- Packing status

Actions:

- Mark packed
- Return to picking
- Complete delivery

---

# 17. Internal Transfers

Route:

```text
/operations/transfers
```

Used to move stock inside the company.

Examples from the source:

- Main Warehouse → Production Floor
- Rack A → Rack B
- Warehouse 1 → Warehouse 2

Every movement must be logged in the stock ledger. fileciteturn0file0L69-L75

## Transfer Fields

- Source warehouse
- Source location
- Destination warehouse
- Destination location
- Product
- Quantity
- UOM
- Scheduled date
- Reason
- Notes

## Transfer Workflow

```text
DRAFT
 ↓
WAITING
 ↓
READY
 ↓
DONE
```

On completion:

```text
Source stock -= quantity
Destination stock += quantity
```

Total company stock remains unchanged.

---

# 18. Stock Adjustments

Route:

```text
/operations/adjustments
```

Purpose:

Fix differences between:

- Recorded stock
- Physical count

The source requires selecting product/location, entering counted quantity, automatically updating stock, and logging the adjustment. fileciteturn0file0L76-L83

## Adjustment Fields

- Product
- Warehouse
- Location
- System quantity
- Physical quantity
- Difference
- Reason
- Notes

Reasons:

- Damaged
- Lost
- Found
- Counting error
- Expired
- Other

Calculation:

```text
difference = physicalQuantity - systemQuantity
```

Example:

```text
System: 100
Physical: 97

Difference = -3
```

Stock becomes:

```text
97
```

Create a ledger entry:

```text
ADJUSTMENT
-3
```

---

# 19. Stock Ledger

Route:

```text
/operations/move-history
```

This is the source of truth for inventory movement history.

Every inventory change must create a ledger entry.

## Ledger Types

```text
RECEIPT
DELIVERY
TRANSFER_IN
TRANSFER_OUT
ADJUSTMENT
```

## Ledger Fields

- ID
- Product
- SKU
- Warehouse
- Location
- Movement type
- Quantity
- Before quantity
- After quantity
- Reference document
- User
- Timestamp
- Reason

Example:

```text
Product: Steel Rods
Movement: RECEIPT
Quantity: +50
Before: 100
After: 150
Reference: REC-00021
User: Tajagn
Time: 10:42 AM
```

## Important Rule

Never update inventory without creating a corresponding ledger record.

---

# 20. Inventory Model

The recommended inventory model separates:

1. Product master data
2. Physical inventory by location
3. Immutable movement ledger

Conceptually:

```text
Product
   ↓
Inventory
   ↓
Warehouse
   ↓
Location
```

And:

```text
Inventory Operation
       ↓
Stock Ledger
```

---

# 21. Reordering Rules

Route:

```text
/products/reordering
```

Features:

- Product
- Warehouse/location
- Minimum stock
- Reorder quantity
- Current stock
- Alert status

Example:

```text
Current: 8
Reorder level: 10

Status: LOW STOCK
```

Recommended statuses:

```text
NORMAL
LOW_STOCK
OUT_OF_STOCK
```

The source explicitly requires reordering rules and low-stock alerts. fileciteturn0file0L26-L31

---

# 22. Alerts & Notifications

## Low Stock Alerts

Trigger when:

```text
currentStock <= reorderLevel
```

## Out of Stock

Trigger when:

```text
currentStock = 0
```

## Notification Types

- Low stock
- Out of stock
- Receipt validated
- Delivery ready
- Delivery completed
- Transfer completed
- Adjustment created
- Adjustment completed

## Notification UI

Topbar notification bell:

```text
🔔 3
```

Notification drawer:

```text
Low stock: Steel Rods
Current stock: 8
Reorder level: 10
```

---

# 23. Global Search

Topbar search should support:

- Product name
- SKU
- Receipt number
- Delivery number
- Transfer number
- Warehouse
- Location

Keyboard shortcut:

```text
Ctrl + K
```

Use shadcn Command component.

---

# 24. Smart Filters

Reusable filter system:

```text
Search
Status
Warehouse
Location
Category
Date
Product
Movement Type
```

Filters should be:

- URL-persisted where useful
- Shareable
- Resettable
- Fast
- Mobile-friendly

Example:

```text
/operations/receipts?status=READY&warehouse=main
```

---

# 25. Tables

Every major list should use a consistent data table.

Required capabilities:

- Sorting
- Pagination
- Search
- Filters
- Column visibility
- Row actions
- Bulk actions where safe
- Loading state
- Empty state
- Error state
- Skeleton state

Example row menu:

```text
View
Edit
Duplicate
Cancel
Delete
```

Dangerous actions must require confirmation.

---

# 26. Forms

All forms should use:

```text
React Hook Form
+
Zod
+
shadcn Form
```

Validation should happen:

1. Client side for UX
2. Server side for security/correctness

Never trust client-side validation.

---

# 27. Prisma Database Schema

Recommended core models:

```text
User
Role
Organization
Warehouse
Location
Category
Product
Inventory
Supplier
Customer
Receipt
ReceiptItem
Delivery
DeliveryItem
Transfer
TransferItem
StockAdjustment
StockLedger
ReorderRule
Notification
AuditLog
OtpToken
```

---

# 28. Prisma Relationships

High-level relationship:

```text
Organization
 ├── Users
 ├── Warehouses
 │    └── Locations
 ├── Categories
 │    └── Products
 ├── Suppliers
 ├── Customers
 └── Operations

Product
 ├── Inventory
 ├── ReceiptItems
 ├── DeliveryItems
 ├── TransferItems
 ├── AdjustmentItems
 ├── StockLedger
 └── ReorderRules
```

---

# 29. Suggested Prisma Schema

```prisma
enum UserRole {
  ADMIN
  INVENTORY_MANAGER
  WAREHOUSE_STAFF
}

enum Status {
  DRAFT
  WAITING
  READY
  PICKING
  PACKED
  DONE
  CANCELED
}

enum MovementType {
  RECEIPT
  DELIVERY
  TRANSFER_IN
  TRANSFER_OUT
  ADJUSTMENT
}

enum AdjustmentReason {
  DAMAGED
  LOST
  FOUND
  COUNTING_ERROR
  EXPIRED
  OTHER
}

model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String?
  role         UserRole @default(WAREHOUSE_STAFF)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  receiptsCreated     Receipt[]         @relation("ReceiptCreator")
  deliveriesCreated   Delivery[]        @relation("DeliveryCreator")
  transfersCreated    Transfer[]         @relation("TransferCreator")
  adjustmentsCreated  StockAdjustment[] @relation("AdjustmentCreator")
  ledgerEntries       StockLedger[]
  notifications       Notification[]
  auditLogs           AuditLog[]
}

model Warehouse {
  id        String   @id @default(cuid())
  name      String
  code      String   @unique
  address   String?
  isActive  Boolean  @default(true)

  locations  Location[]
  inventory  Inventory[]
  receipts   Receipt[]
  deliveries Delivery[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Location {
  id          String @id @default(cuid())
  name        String
  code        String
  warehouseId String

  warehouse  Warehouse   @relation(fields: [warehouseId], references: [id])
  inventory  Inventory[]
  ledger     StockLedger[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([warehouseId, code])
  @@index([warehouseId])
}

model Category {
  id        String @id @default(cuid())
  name      String @unique
  description String?

  products Product[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Product {
  id          String @id @default(cuid())
  name        String
  sku         String @unique
  description String?
  uom         String
  barcode     String?
  categoryId  String

  category Category @relation(fields: [categoryId], references: [id])

  inventory    Inventory[]
  receiptItems ReceiptItem[]
  deliveryItems DeliveryItem[]
  transferItems TransferItem[]
  ledger       StockLedger[]
  reorderRules ReorderRule[]

  isActive Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([categoryId])
  @@index([name])
}

model Inventory {
  id          String @id @default(cuid())
  productId   String
  warehouseId String
  locationId  String

  quantity Int @default(0)

  product   Product   @relation(fields: [productId], references: [id])
  warehouse Warehouse @relation(fields: [warehouseId], references: [id])
  location  Location  @relation(fields: [locationId], references: [id])

  updatedAt DateTime @updatedAt

  @@unique([productId, locationId])
  @@index([productId])
  @@index([warehouseId])
}

model Supplier {
  id      String @id @default(cuid())
  name    String
  email   String?
  phone   String?
  address String?

  receipts Receipt[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Customer {
  id      String @id @default(cuid())
  name    String
  email   String?
  phone   String?
  address String?

  deliveries Delivery[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Receipt {
  id          String @id @default(cuid())
  receiptNo   String @unique
  supplierId  String
  warehouseId String
  status      Status @default(DRAFT)
  notes       String?

  createdById String

  supplier  Supplier  @relation(fields: [supplierId], references: [id])
  warehouse Warehouse @relation(fields: [warehouseId], references: [id])
  createdBy User      @relation("ReceiptCreator", fields: [createdById], references: [id])

  items ReceiptItem[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([supplierId])
  @@index([warehouseId])
  @@index([status])
}

model ReceiptItem {
  id        String @id @default(cuid())
  receiptId String
  productId String
  locationId String

  quantity Int

  receipt  Receipt  @relation(fields: [receiptId], references: [id], onDelete: Cascade)
  product  Product  @relation(fields: [productId], references: [id])

  @@index([receiptId])
  @@index([productId])
}

model Delivery {
  id          String @id @default(cuid())
  deliveryNo  String @unique
  customerId  String
  warehouseId String
  status      Status @default(DRAFT)
  notes       String?

  createdById String

  customer  Customer  @relation(fields: [customerId], references: [id])
  warehouse Warehouse @relation(fields: [warehouseId], references: [id])
  createdBy User      @relation("DeliveryCreator", fields: [createdById], references: [id])

  items DeliveryItem[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([customerId])
  @@index([warehouseId])
  @@index([status])
}

model DeliveryItem {
  id         String @id @default(cuid())
  deliveryId String
  productId  String
  locationId String

  quantity Int
  pickedQuantity Int @default(0)
  packedQuantity Int @default(0)

  delivery Delivery @relation(fields: [deliveryId], references: [id], onDelete: Cascade)
  product  Product  @relation(fields: [productId], references: [id])

  @@index([deliveryId])
  @@index([productId])
}

model Transfer {
  id              String @id @default(cuid())
  transferNo      String @unique
  sourceWarehouseId String
  sourceLocationId  String
  destinationWarehouseId String
  destinationLocationId String

  status Status @default(DRAFT)
  notes  String?

  createdById String

  createdBy User @relation("TransferCreator", fields: [createdById], references: [id])

  items TransferItem[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([status])
}

model TransferItem {
  id         String @id @default(cuid())
  transferId String
  productId  String
  quantity   Int

  transfer Transfer @relation(fields: [transferId], references: [id], onDelete: Cascade)
  product  Product  @relation(fields: [productId], references: [id])

  @@index([transferId])
  @@index([productId])
}

model StockAdjustment {
  id         String @id @default(cuid())
  adjustmentNo String @unique

  productId  String
  warehouseId String
  locationId String

  systemQuantity   Int
  physicalQuantity Int
  difference       Int

  reason AdjustmentReason
  notes  String?

  createdById String

  createdBy User @relation("AdjustmentCreator", fields: [createdById], references: [id])

  createdAt DateTime @default(now())

  @@index([productId])
  @@index([warehouseId])
  @@index([locationId])
}

model StockLedger {
  id          String       @id @default(cuid())
  productId   String
  warehouseId String?
  locationId  String?
  movementType MovementType

  quantity Int
  beforeQuantity Int
  afterQuantity Int

  referenceType String?
  referenceId   String?

  reason String?

  userId String

  product   Product   @relation(fields: [productId], references: [id])
  location  Location? @relation(fields: [locationId], references: [id])
  user      User      @relation(fields: [userId], references: [id])

  createdAt DateTime @default(now())

  @@index([productId, createdAt])
  @@index([warehouseId, createdAt])
  @@index([locationId, createdAt])
  @@index([referenceId])
}

model ReorderRule {
  id          String @id @default(cuid())
  productId   String
  warehouseId String?
  locationId  String?

  reorderLevel Int
  reorderQuantity Int

  product Product @relation(fields: [productId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([productId])
}

model Notification {
  id      String @id @default(cuid())
  userId  String
  title   String
  message String
  type    String
  readAt  DateTime?

  user User @relation(fields: [userId], references: [id])

  createdAt DateTime @default(now())

  @@index([userId, readAt])
}

model AuditLog {
  id        String @id @default(cuid())
  userId    String
  action    String
  entity    String
  entityId  String
  metadata  Json?

  user User @relation(fields: [userId], references: [id])

  createdAt DateTime @default(now())

  @@index([entity, entityId])
  @@index([userId, createdAt])
}

model OtpToken {
  id        String   @id @default(cuid())
  email     String
  codeHash  String
  expiresAt DateTime
  attempts  Int      @default(0)
  usedAt    DateTime?
  createdAt DateTime @default(now())

  @@index([email])
  @@index([expiresAt])
}
```

> The schema is a starting architecture, not a final migration. Review tenant/organization requirements, deletion policies, document numbering, and business rules before production migration.

---

# 30. Inventory Transaction Rules

Inventory operations are the most important business logic in the system.

## Receipt

```text
Before = 100
Received = 50

After = 150
```

Create:

```text
Inventory update
+
StockLedger entry
+
AuditLog entry
```

All inside one Prisma transaction.

## Delivery

```text
Before = 100
Delivered = 20

After = 80
```

Create:

```text
Inventory update
+
StockLedger entry
+
AuditLog entry
```

## Transfer

Source:

```text
100 → 70
```

Destination:

```text
20 → 50
```

Create two ledger records:

```text
TRANSFER_OUT -30
TRANSFER_IN +30
```

## Adjustment

```text
System = 100
Physical = 97
Difference = -3

Inventory = 97
```

Create adjustment + ledger + audit record.

---

# 31. Critical Database Safety

All stock-changing operations must use:

```ts
prisma.$transaction(...)
```

Never do:

```text
update inventory
then later create ledger
```

because a failure between those operations creates inconsistent inventory.

Instead:

```text
BEGIN TRANSACTION

1. Validate stock
2. Read current inventory
3. Calculate new quantity
4. Update inventory
5. Create ledger entry
6. Create audit entry
7. Update operation status

COMMIT
```

If any step fails:

```text
ROLLBACK
```

---

# 32. Concurrency Protection

Inventory can be changed by multiple warehouse workers at the same time.

The implementation must protect against:

```text
Worker A sees 10
Worker B sees 10

A removes 8
B removes 8

Incorrect result could become -6
```

Use database transactions and appropriate isolation/locking strategy.

For high-contention inventory:

- Re-read current quantity inside transaction
- Validate again immediately before update
- Use atomic conditional updates where practical
- Fail safely if stock changed during operation

---

# 33. API Structure

Recommended API structure:

```text
/api/auth/*
/api/dashboard
/api/products
/api/products/[id]
/api/categories
/api/warehouses
/api/locations

/api/receipts
/api/receipts/[id]
/api/receipts/[id]/validate

/api/deliveries
/api/deliveries/[id]
/api/deliveries/[id]/pick
/api/deliveries/[id]/pack
/api/deliveries/[id]/validate

/api/transfers
/api/transfers/[id]
/api/transfers/[id]/validate

/api/adjustments
/api/adjustments/[id]

/api/inventory
/api/inventory/[productId]
/api/ledger
/api/notifications
/api/reports
```

---

# 34. Service Layer

Do not put all business logic directly inside route handlers.

Recommended structure:

```text
src/
├── app/
├── components/
├── lib/
│   ├── auth/
│   ├── db/
│   ├── validations/
│   ├── permissions/
│   └── utils/
├── services/
│   ├── inventory.service.ts
│   ├── receipt.service.ts
│   ├── delivery.service.ts
│   ├── transfer.service.ts
│   ├── adjustment.service.ts
│   ├── notification.service.ts
│   └── dashboard.service.ts
├── repositories/
│   ├── product.repository.ts
│   ├── inventory.repository.ts
│   └── ledger.repository.ts
└── types/
```

Business logic example:

```ts
await receiptService.validateReceipt(receiptId, userId)
```

instead of putting the entire workflow in:

```text
/api/receipts/[id]/validate
```

---

# 35. Recommended Next.js Folder Structure

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   └── verify-otp/
│   │
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   ├── [id]/
│   │   │   └── categories/
│   │   ├── operations/
│   │   │   ├── receipts/
│   │   │   ├── deliveries/
│   │   │   ├── transfers/
│   │   │   ├── adjustments/
│   │   │   └── move-history/
│   │   └── settings/
│   │       ├── warehouses/
│   │       └── locations/
│   │
│   └── api/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── dashboard/
│   ├── products/
│   ├── receipts/
│   ├── deliveries/
│   ├── transfers/
│   ├── adjustments/
│   ├── inventory/
│   └── tables/
│
├── services/
├── repositories/
├── lib/
├── hooks/
├── types/
├── validations/
└── prisma/
    └── schema.prisma
```

---

# 36. Page Inventory

## Public

```text
/
 /login
 /signup
 /forgot-password
 /reset-password
 /verify-otp
```

## Dashboard

```text
/dashboard
```

## Products

```text
/products
/products/new
/products/[id]
/products/[id]/edit
/products/categories
/products/reordering
```

## Operations

```text
/operations/receipts
/operations/receipts/new
/operations/receipts/[id]

/operations/deliveries
/operations/deliveries/new
/operations/deliveries/[id]

/operations/transfers
/operations/transfers/new
/operations/transfers/[id]

/operations/adjustments
/operations/adjustments/new
/operations/adjustments/[id]

/operations/move-history
```

## Settings

```text
/settings/warehouses
/settings/locations
/settings/profile
```

---

# 37. Loading States

Every page that loads data needs:

- Skeleton
- Spinner only for small actions
- Disabled submit buttons
- Optimistic feedback where safe

Example:

```text
ProductTableSkeleton
DashboardCardSkeleton
ProductDetailSkeleton
```

Use shadcn Skeleton.

---

# 38. Empty States

Examples:

```text
No products found

Create your first product to start managing inventory.
[Create Product]
```

For receipts:

```text
No receipts yet
[Create Receipt]
```

Do not show empty tables with no explanation.

---

# 39. Error Handling

Errors should be user-friendly.

Example:

```text
Unable to validate receipt.

The inventory could not be updated because another
operation changed the stock.

Please refresh and try again.
```

Never expose:

- Prisma stack traces
- Database credentials
- Internal SQL
- Server secrets

---

# 40. Confirmation Dialogs

Required for:

- Delete product
- Archive warehouse
- Cancel receipt
- Cancel delivery
- Cancel transfer
- Stock adjustment
- Validate inventory-changing operation

Example:

```text
Validate Receipt?

This will increase inventory for 8 products.
This action cannot be automatically reversed.

[Cancel] [Validate Receipt]
```

---

# 41. Audit Logging

Every sensitive action should create an AuditLog.

Examples:

```text
PRODUCT_CREATED
PRODUCT_UPDATED
RECEIPT_CREATED
RECEIPT_VALIDATED
DELIVERY_CREATED
DELIVERY_VALIDATED
TRANSFER_CREATED
TRANSFER_COMPLETED
STOCK_ADJUSTED
WAREHOUSE_UPDATED
USER_ROLE_CHANGED
```

Store:

- User
- Action
- Entity
- Entity ID
- Timestamp
- Metadata

---

# 42. Authorization

Never rely only on hidden UI buttons.

Every server mutation must check:

```text
authenticated user
+
role
+
resource access
```

Example:

```ts
requireRole(["INVENTORY_MANAGER"])
```

Warehouse staff should not be able to call an inventory-manager-only API manually.

---

# 43. Security

Required:

- Password hashing
- Secure cookies
- CSRF protection where applicable
- Input validation
- Rate limiting
- OTP expiry
- OTP attempt limits
- Authorization on server
- No secrets in frontend
- Environment variables
- SQL injection protection through Prisma
- Audit logging
- Secure headers
- Error sanitization

---

# 44. Environment Variables

Example:

```env
DATABASE_URL=

AUTH_SECRET=

NEXTAUTH_URL=

EMAIL_SERVER_HOST=
EMAIL_SERVER_PORT=
EMAIL_SERVER_USER=
EMAIL_SERVER_PASSWORD=
EMAIL_FROM=

NEXT_PUBLIC_APP_URL=
```

Never commit `.env`.

Provide:

```text
.env.example
```

---

# 45. Reporting

Recommended reports:

### Inventory Report
- Product
- SKU
- Warehouse
- Location
- Quantity
- Stock value if cost data is implemented

### Movement Report
- Date
- Product
- Movement
- Quantity
- User
- Reference

### Low Stock Report
- Product
- Current stock
- Reorder level
- Suggested reorder quantity

### Operation Report
- Receipts
- Deliveries
- Transfers
- Adjustments

Export options:

```text
CSV
```

PDF export can be added later.

---

# 46. Barcode Support

Recommended enhancement:

- Barcode field on products
- Barcode search
- Camera barcode scanning on supported devices
- Scan product during picking/counting

Workflow:

```text
Scan barcode
↓
Find product
↓
Select location
↓
Enter quantity
↓
Confirm
```

This is an engineering enhancement beyond the minimum source requirements.

---

# 47. Responsive Design

Desktop:

```text
Sidebar + Main Content
```

Tablet:

```text
Collapsible sidebar
```

Mobile:

```text
Bottom/Sheet navigation
Stacked forms
Scrollable tables
Large touch targets
```

Operations should remain usable on warehouse tablets.

---

# 48. Accessibility

Required:

- Keyboard navigation
- Visible focus state
- ARIA labels
- Semantic HTML
- Sufficient contrast
- Form error messages
- Screen-reader-friendly dialogs
- No interaction dependent only on color

---

# 49. Performance

Use:

- Server Components for read-heavy pages
- Pagination for large tables
- Database indexes
- Select only required Prisma fields
- Avoid N+1 queries
- Parallel data fetching where independent
- Debounced search
- Cached reference data where appropriate
- Virtualized lists for very large datasets

Avoid fetching all inventory records to the browser.

---

# 50. Database Indexing

Important indexes:

```text
Product.sku
Product.name
Inventory.productId
Inventory.warehouseId
Inventory.productId + locationId
Receipt.status
Receipt.warehouseId
Delivery.status
Delivery.warehouseId
StockLedger.productId + createdAt
StockLedger.locationId + createdAt
Notification.userId + readAt
AuditLog.entity + entityId
```

Review indexes based on real query patterns after implementation.

---

# 51. Seed Data

Create Prisma seed data for development.

Example:

```text
Users
├── admin@stocksense.dev
├── manager@stocksense.dev
└── warehouse@stocksense.dev

Categories
├── Raw Materials
├── Finished Goods
└── Components

Warehouse
└── Main Warehouse

Locations
├── Rack A
├── Rack B
├── Production Floor
└── Dispatch Area

Products
├── Steel Rods
├── Chairs
├── Bolts
└── Aluminum Sheets
```

Seed realistic receipts, deliveries, transfers, adjustments, and ledger entries.

---

# 52. Stock Flow Example

The source provides this inventory flow:

## Step 1 — Receive Goods

```text
Receive 100 kg Steel

Stock:
+100
```

## Step 2 — Internal Transfer

```text
Main Store
→
Production Rack

Total stock:
unchanged

Location:
updated
```

## Step 3 — Delivery

```text
Deliver 20 steel

Stock:
-20
```

## Step 4 — Damage Adjustment

```text
3 kg damaged

Stock:
-3
```

Every operation is logged in the Stock Ledger. fileciteturn0file0L88-L102

---

# 53. Business Rules

## Product

```text
SKU must be unique.
Product must belong to a category.
Product must have a valid UOM.
```

## Receipt

```text
Cannot validate empty receipt.
Received quantity must be >= 0.
Validation increases stock.
Receipt cannot be validated twice.
```

## Delivery

```text
Cannot deliver more than available stock.
Validation decreases stock.
Delivery cannot be completed twice.
```

## Transfer

```text
Source and destination cannot be identical.
Source must have enough stock.
Transfer changes locations.
Total company quantity remains unchanged.
```

## Adjustment

```text
Physical quantity cannot be negative.
Difference is automatically calculated.
Adjustment creates a ledger entry.
```

---

# 54. Reversal Strategy

Do not physically delete completed inventory transactions.

Instead of:

```text
DELETE receipt
```

use:

```text
REVERSAL
```

For example:

```text
Original receipt:
+50

Reversal:
-50
```

This preserves the audit trail.

---

# 55. Document Numbering

Use human-readable document IDs:

```text
REC-000001
DEL-000001
TRF-000001
ADJ-000001
```

Do not use database CUIDs as the primary user-facing document number.

---

# 56. Notifications

Initial implementation can use database notifications.

Future real-time implementation can use:

- WebSockets
- Server-Sent Events
- Pusher
- Ably

Do not introduce real-time infrastructure unless the requirement actually needs live cross-user updates.

---

# 57. Dashboard Calculation Rules

## Total Stock

Sum inventory quantities across active locations.

## Low Stock

Products where:

```text
currentQuantity <= reorderLevel
AND currentQuantity > 0
```

## Out of Stock

```text
currentQuantity = 0
```

## Pending Receipts

Receipts with:

```text
DRAFT
WAITING
READY
```

## Pending Deliveries

Deliveries not yet:

```text
DONE
CANCELED
```

## Scheduled Transfers

Transfers with:

```text
WAITING
READY
```

---

# 58. Testing Strategy

## Unit Tests

Test:

- Stock calculation
- Reorder logic
- Adjustment difference
- Permission checks
- Status transitions
- Document numbering

## Integration Tests

Test:

```text
Create receipt
→ validate
→ inventory increases
→ ledger created
```

```text
Create delivery
→ validate
→ inventory decreases
→ ledger created
```

```text
Transfer
→ source decreases
→ destination increases
→ two ledger entries
```

## End-to-End Tests

Use Playwright for:

- Login
- Create product
- Create receipt
- Validate receipt
- Create delivery
- Pick
- Pack
- Validate delivery
- Transfer
- Adjustment
- Search/filter

---

# 59. Status Transition Rules

Implement a centralized status transition system.

Example:

```text
DRAFT → WAITING
WAITING → READY
READY → PICKING
PICKING → PACKED
PACKED → DONE
```

Invalid:

```text
DONE → DRAFT
DONE → READY
```

Unless an explicit reversal process exists.

Never allow arbitrary status changes from the frontend.

---

# 60. UX for Inventory Operations

The user should be able to complete common tasks quickly.

Example:

```text
Create Receipt

Supplier       [Select]
Warehouse      [Select]

Products
[Search product]

Steel Rods     100 kg
Chairs         20 pcs

                 [Save Draft]
                 [Validate Receipt]
```

Avoid unnecessary multi-page forms for simple operations.

---

# 61. Recommended Reusable Components

```text
<AppSidebar />
<Topbar />
<GlobalSearch />
<NotificationBell />
<UserMenu />

<KpiCard />
<StatusBadge />
<DataTable />
<DataTableToolbar />
<FilterBar />
<EmptyState />
<ErrorState />
<ConfirmDialog />

<ProductCombobox />
<WarehouseCombobox />
<LocationCombobox />
<CategoryCombobox />

<StockBadge />
<InventorySummary />
<StockMovementTable />
<StockLedgerTable />

<ReceiptForm />
<ReceiptItemsTable />

<DeliveryForm />
<PickingTable />
<PackingTable />

<TransferForm />
<AdjustmentForm />
```

---

# 62. Recommended Utility Functions

```ts
calculateAvailableStock()
calculateLowStockStatus()
calculateAdjustmentDifference()
generateDocumentNumber()
validateStockAvailability()
validateStatusTransition()
createStockLedgerEntry()
createAuditLog()
checkPermission()
```

---

# 63. Error Codes

Use consistent application errors:

```text
PRODUCT_NOT_FOUND
INSUFFICIENT_STOCK
INVALID_STATUS_TRANSITION
RECEIPT_ALREADY_VALIDATED
DELIVERY_ALREADY_VALIDATED
TRANSFER_SOURCE_DESTINATION_SAME
WAREHOUSE_NOT_FOUND
LOCATION_NOT_FOUND
UNAUTHORIZED
FORBIDDEN
VALIDATION_ERROR
```

---

# 64. Definition of Done

A feature is not complete when the UI works.

A feature is complete when:

- UI works
- Server validation works
- Authorization works
- Prisma query works
- Database transaction is safe
- Error states work
- Loading states work
- Empty states work
- Audit log is created where required
- Stock ledger is created where required
- Tests exist
- Responsive behavior works

---

# 65. MVP Priority

## Phase 1 — Foundation

- Next.js setup
- TypeScript
- Tailwind
- shadcn/ui
- Auth
- Prisma
- PostgreSQL
- Base layout
- Sidebar
- User roles
- Permissions

## Phase 2 — Product & Inventory

- Products
- Categories
- Warehouses
- Locations
- Inventory
- Stock availability

## Phase 3 — Operations

- Receipts
- Deliveries
- Picking
- Packing
- Transfers
- Adjustments

## Phase 4 — Ledger & Alerts

- Stock ledger
- Audit logs
- Low stock alerts
- Notifications
- Reorder rules

## Phase 5 — Dashboard & Reports

- KPIs
- Charts
- Filters
- Reports
- CSV export

## Phase 6 — Quality

- Testing
- Security
- Performance
- Accessibility
- Responsive design
- Error handling

---

# 66. Features That Should NOT Be Overbuilt Initially

Avoid adding these before the core inventory flow works:

- AI forecasting
- Complex accounting
- Full ERP
- Payroll
- CRM
- Advanced procurement
- Complicated workflow automation
- Microservices
- Kubernetes
- Event-driven architecture everywhere
- Multiple databases
- Real-time WebSocket infrastructure without a real need

The core value is:

```text
Product
   ↓
Location
   ↓
Inventory
   ↓
Receipt / Delivery / Transfer / Adjustment
   ↓
Stock Ledger
   ↓
Dashboard
```

Make this reliable before adding advanced features.

---

# 67. Final Architecture

```text
                    ┌─────────────────────┐
                    │      Next.js        │
                    │     App Router      │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
       Server Components   Server Actions   Route Handlers
              │                │                │
              └────────────────┼────────────────┘
                               │
                       Service Layer
                               │
                    ┌──────────┴──────────┐
                    │                     │
              Prisma ORM            Auth / RBAC
                    │                     │
                    └──────────┬──────────┘
                               │
                         PostgreSQL
                               │
       ┌───────────────────────┼───────────────────────┐
       │                       │                       │
    Products                Inventory              Ledger
       │                       │                       │
 Categories              Warehouse/Location       Audit Logs
       │
 Operations
 ├── Receipts
 ├── Deliveries
 ├── Transfers
 └── Adjustments
```

---

# 68. Final Implementation Checklist

## Project Setup
- [ ] Next.js App Router
- [ ] TypeScript
- [ ] Tailwind CSS
- [ ] shadcn/ui
- [ ] Aceternity UI
- [ ] ESLint
- [ ] Prettier
- [ ] Environment variables

## Authentication
- [ ] Login
- [ ] Signup
- [ ] Logout
- [ ] OTP password reset
- [ ] Session management
- [ ] Role-based authorization

## Products
- [ ] Product CRUD
- [ ] SKU
- [ ] Categories
- [ ] UOM
- [ ] Search
- [ ] Filters
- [ ] Product detail
- [ ] Stock by location

## Warehouse
- [ ] Warehouse CRUD
- [ ] Location CRUD
- [ ] Multi-warehouse support

## Inventory
- [ ] Inventory table
- [ ] Stock calculation
- [ ] Stock availability
- [ ] Low stock
- [ ] Out of stock
- [ ] Reorder rules

## Receipts
- [ ] Create
- [ ] Edit
- [ ] View
- [ ] Validate
- [ ] Stock increase
- [ ] Ledger entry

## Deliveries
- [ ] Create
- [ ] Edit
- [ ] Pick
- [ ] Pack
- [ ] Validate
- [ ] Stock decrease
- [ ] Ledger entry

## Transfers
- [ ] Create
- [ ] Source location
- [ ] Destination location
- [ ] Validate
- [ ] Source decrease
- [ ] Destination increase
- [ ] Ledger entries

## Adjustments
- [ ] Physical count
- [ ] Difference calculation
- [ ] Reason
- [ ] Stock update
- [ ] Ledger entry

## Dashboard
- [ ] KPIs
- [ ] Filters
- [ ] Charts
- [ ] Recent activity
- [ ] Low stock
- [ ] Pending operations

## Ledger
- [ ] All stock movements
- [ ] Before quantity
- [ ] Movement quantity
- [ ] After quantity
- [ ] Reference
- [ ] User
- [ ] Timestamp

## Notifications
- [ ] Low stock
- [ ] Out of stock
- [ ] Operation notifications
- [ ] Read/unread

## Audit
- [ ] Audit log
- [ ] User
- [ ] Action
- [ ] Entity
- [ ] Metadata
- [ ] Timestamp

## Quality
- [ ] Loading states
- [ ] Empty states
- [ ] Error states
- [ ] Confirmation dialogs
- [ ] Responsive UI
- [ ] Accessibility
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests

---

# 69. Core Principle

The system should treat the **Stock Ledger as the historical record of inventory movement** and the **Inventory table as the current stock state**.

Every operation that changes stock must atomically update:

```text
Inventory
+
Stock Ledger
+
Audit Log
```

This rule is the foundation of StockSense.

The source problem statement's central flow is:

```text
Receive Stock
     ↓
Move Stock
     ↓
Deliver Stock
     ↓
Adjust Stock
     ↓
Everything appears in Stock Ledger
```

That flow should remain simple, fast, auditable, and reliable before expanding the product into broader ERP functionality.
