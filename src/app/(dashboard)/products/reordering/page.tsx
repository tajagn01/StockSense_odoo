import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { ReorderRulesClientView } from "@/components/products/ReorderRulesClientView";

export default async function ReorderingPage() {
  await requireAuth();

  const rules = await prisma.reorderRule.findMany({
    include: {
      product: {
        include: {
          inventory: {
            include: {
              warehouse: true,
              location: true,
            },
          },
        },
      },
    },
    orderBy: { reorderLevel: "desc" },
  });

  return <ReorderRulesClientView rules={rules} />;
}
