# StockSense — Inventory Management System

> Real-time, centralized Inventory Management System (IMS) built with **Next.js (App Router)**, **TypeScript**, **shadcn/ui**, **Aceternity UI**, **PostgreSQL**, and **Prisma ORM**.

---

## 🚀 Overview

StockSense is an enterprise-grade Inventory Management System designed to replace manual registers, spreadsheets, and fragmented stock tracking with one unified, auditable application.

### Key Capabilities

- **Real-Time Inventory Visibility**: Immediate stock level updates across multiple warehouses and locations.
- **Product & Category Catalog**: SKU generation, custom units of measure, barcode scanning, and status tracking.
- **Operations Workflow**:
  - **Receipts**: Validate incoming shipments and increment stock.
  - **Delivery Orders**: Pick, pack, and validate outgoing orders with automatic stock decrement.
  - **Internal Transfers**: Move stock between warehouses/locations with zero net loss.
  - **Inventory Adjustments**: Physical inventory counts with automatic discrepancy calculation.
- **Stock Ledger**: Immutable, append-only log of every single movement in the system.
- **Role-Based Access Control**: Tailored workflows for Inventory Managers and Warehouse Staff.

---

## 📁 Project Structure

```text
├── .env                              # Environment configuration (local)
├── .env.example                      # Environment variables template
├── .gitignore                        # Git ignore patterns
├── README.md                         # Project documentation
├── StockSense_Project_Specification.md# Detailed functional and technical specification
├── prisma/
│   └── schema.prisma                 # PostgreSQL database schema & models
├── public/                           # Static assets
└── src/
    ├── app/                          # Next.js App Router
    │   ├── (auth)/                   # Authentication route group
    │   │   ├── forgot-password/
    │   │   ├── login/
    │   │   ├── reset-password/
    │   │   └── signup/
    │   ├── (dashboard)/              # Main application layout & routes
    │   │   ├── dashboard/            # KPI cards, charts, alerts
    │   │   ├── operations/           # Receipts, Deliveries, Transfers, Adjustments, Ledger
    │   │   │   ├── adjustments/
    │   │   │   ├── deliveries/
    │   │   │   ├── move-history/
    │   │   │   ├── receipts/
    │   │   │   └── transfers/
    │   │   ├── products/             # Product list & SKU management
    │   │   ├── profile/              # User account settings
    │   │   └── settings/             # Warehouse & organization settings
    │   │       └── warehouses/
    │   └── api/                      # Backend Route Handlers
    │       ├── adjustments/
    │       ├── auth/
    │       ├── deliveries/
    │       ├── ledger/
    │       ├── notifications/
    │       ├── products/
    │       ├── receipts/
    │       ├── reports/
    │       └── transfers/
    ├── components/
    │   ├── dashboard/                # Dashboard widgets & KPI components
    │   ├── layout/                   # Sidebar, Topbar, Navigation
    │   ├── operations/               # Operation forms & action modals
    │   ├── products/                 # Product tables & modals
    │   └── ui/                       # shadcn/ui & Aceternity UI components
    ├── hooks/                        # Custom React hooks
    ├── lib/                          # Database client, auth, utility functions
    │   └── validations/              # Zod validation schemas
    ├── services/                     # Business logic & inventory transactions
    └── types/                        # TypeScript definitions
```

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Aceternity UI](https://ui.aceternity.com/), [Lucide React](https://lucide.dev/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: NextAuth.js / Auth.js with secure session management
- **Validation**: [Zod](https://zod.dev/)

---

## ⚙️ Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/tajagn01/StockSense_odoo.git
   cd StockSense_odoo
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your PostgreSQL database URL and authentication secrets.

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Initialize database schema**:
   ```bash
   npx prisma db push
   ```

5. **Run development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.
