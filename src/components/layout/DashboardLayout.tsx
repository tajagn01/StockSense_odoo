import { prisma } from "@/lib/prisma";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export async function DashboardLayout({ children }: DashboardLayoutProps) {
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
    <div className="flex min-h-screen bg-[#F2F2ED] text-[#464B71]">
      <Sidebar
        stats={{
          pendingReceipts,
          pendingDeliveries,
          lowStockCount,
        }}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar warehouses={warehouses} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
