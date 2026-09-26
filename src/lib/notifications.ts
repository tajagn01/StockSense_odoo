import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function createNotification({
  userId,
  title,
  message,
  type,
}: {
  userId: string;
  title: string;
  message: string;
  type: string;
}) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

export async function notifyManagersAndAdmin({
  title,
  message,
  type,
}: {
  title: string;
  message: string;
  type: string;
}) {
  try {
    const managers = await prisma.user.findMany({
      where: {
        role: { in: [UserRole.ADMIN, UserRole.INVENTORY_MANAGER] },
      },
      select: { id: true },
    });

    if (managers.length > 0) {
      await prisma.notification.createMany({
        data: managers.map((m) => ({
          userId: m.id,
          title,
          message,
          type,
        })),
      });
    }
  } catch (error) {
    console.error("Failed to notify managers:", error);
  }
}
