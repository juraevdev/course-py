import { CreateTopicForm } from "@/components/forms";
import { PageIntro, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function NewTopicPage() {
  const user = await requireUser(Role.TEACHER);
  if (!user) return null;

  const cohorts = await prisma.cohort.findMany({
    where: { authorId: user.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <>
      <PageIntro
        eyebrow="Yangi material"
        title="Mavzu joylash"
        description="Offline darsdagi mavzuni kod misollari va hujjatlar bilan qo‘llab-quvvatlang. Joylaganingizdan so‘ng o‘quvchilarga bildirishnoma ketadi."
      />
      <Panel className="max-w-2xl">
        <CreateTopicForm cohorts={cohorts} />
      </Panel>
    </>
  );
}
