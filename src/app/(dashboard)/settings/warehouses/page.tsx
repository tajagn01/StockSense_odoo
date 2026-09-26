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
      <div className="pb-2 border-b border-[rgba(70,75,113,0.12)]">
        <h1 className="text-2xl font-bold tracking-tight text-[#464B71]">Warehouses & Locations</h1>
        <p className="text-xs text-[#646981] mt-0.5">
          Manage distribution hubs, aisles, and storage bins across multi-facility operations.
        </p>
      </div>

      <WarehousesClientView warehouses={warehouses} />
    </div>
  );
}
