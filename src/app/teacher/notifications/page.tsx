import { NotificationList } from "@/components/notifications";
import { PageIntro } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function TeacherNotificationsPage() {
  const user = await requireUser(Role.TEACHER);
  if (!user) return null;

  const items = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageIntro
        eyebrow="Inbox"
        title="Bildirishnomalar"
        description="O‘quvchilarning yangi javoblari shu yerda."
      />
      <NotificationList items={items} />
    </>
  );
}
