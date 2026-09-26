import { prisma } from "@/lib/prisma";
import { WarehousesClientView } from "@/components/settings/WarehousesClientView";

export const dynamic = "force-dynamic";

export default async function WarehousesPage() {
  const warehouses = await prisma.warehouse.findMany({
    include: {
      locations: true,
      inventory: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-white">Warehouses & Storage Locations</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure distribution centers, aisles, and storage bins across multi-facility operations.
        </p>
      </div>

      <WarehousesClientView warehouses={warehouses} />
    </div>
  );
}
