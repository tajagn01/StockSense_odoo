import { prisma } from "@/lib/prisma";
import { DeliveriesClientView } from "@/components/operations/DeliveriesClientView";

export const dynamic = "force-dynamic";

export default async function DeliveriesPage() {
  const [deliveries, customers, warehouses, locations, products] = await Promise.all([
    prisma.delivery.findMany({
      include: {
        customer: true,
        warehouse: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    prisma.warehouse.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.location.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="pb-2 border-b border-[rgba(70,75,113,0.12)]">
        <h1 className="text-2xl font-bold tracking-tight text-[#464B71]">Delivery Orders</h1>
        <p className="text-xs text-[#646981] mt-0.5">
          Pick, pack, and validate customer orders with real-time stock allocation and availability verification.
        </p>
      </div>

      <DeliveriesClientView
        deliveries={deliveries}
        customers={customers}
        warehouses={warehouses}
        locations={locations}
        products={products}
      />
    </div>
  );
}
