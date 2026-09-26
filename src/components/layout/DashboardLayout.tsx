import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { DashboardShell } from "./DashboardShell";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Enforce authentication at dashboard root
  const user = await requireAuth();

  let warehouses: Array<{ id: string; name: string; code: string }> = [];
  let pendingReceipts = 0;
  let pendingDeliveries = 0;
  let lowStockCount = 0;

  try {
    const [whList, pReceipts, pDeliveries, products] = await Promise.all([
      prisma.warehouse.findMany({
        where: { isActive: true },
        select: { id: true, name: true, code: true },
      }),
      prisma.receipt.count({
        where: { status: { in: ["DRAFT", "WAITING", "READY"] } },
      }),
      prisma.delivery.count({
        where: { status: { in: ["DRAFT", "WAITING", "READY", "PICKING", "PACKED"] } },
      }),
      prisma.product.findMany({
        include: {
          inventory: true,
          reorderRules: true,
        },
      }),
    ]);

    warehouses = whList;
    pendingReceipts = pReceipts;
    pendingDeliveries = pDeliveries;

    lowStockCount = products.filter((p) => {
      const totalStock = p.inventory.reduce((acc, i) => acc + i.quantity, 0);
      const reorderLevel = p.reorderRules[0]?.reorderLevel ?? 20;
      return totalStock <= reorderLevel;
    }).length;
  } catch (error) {
    console.error("Failed to load layout stats from database:", error);
  }

  return (
    <DashboardShell
      user={user}
      warehouses={warehouses}
      stats={{
        pendingReceipts,
        pendingDeliveries,
        lowStockCount,
      }}
    >
      {children}
    </DashboardShell>
  );
}
