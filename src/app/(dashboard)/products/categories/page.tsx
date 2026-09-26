import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { CategoryManagementClientView } from "@/components/products/CategoryManagementClientView";

export default async function CategoriesPage() {
  await requireAuth();

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return <CategoryManagementClientView categories={categories} />;
}
