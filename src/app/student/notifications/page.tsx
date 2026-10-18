import { NotificationList } from "@/components/notifications";
import { PageIntro } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function StudentNotificationsPage() {
  const user = await requireUser(Role.STUDENT);
  if (!user) return null;

  const items = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageIntro
        eyebrow="Yangiliklar"
        title="Bildirishnomalar"
        description="Yangi mavzu va topshiriqlar shu yerda paydo bo‘ladi."
      />
      <NotificationList items={items} />
    </>
  );
}
