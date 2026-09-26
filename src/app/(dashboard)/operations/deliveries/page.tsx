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
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-white">Delivery Orders</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Pick, pack, and validate customer dispatches with automated stock availability verification.
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
