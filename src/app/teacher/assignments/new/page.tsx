import { CreateAssignmentForm } from "@/components/forms";
import { PageIntro, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function NewAssignmentPage({
  searchParams,
}: {
  searchParams: Promise<{ topicId?: string }>;
}) {
  const user = await requireUser(Role.TEACHER);
  if (!user) return null;

  const { topicId } = await searchParams;
  const [topics, cohorts] = await Promise.all([
    prisma.topic.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
    }),
    prisma.cohort.findMany({
      where: { authorId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <>
      <PageIntro
        eyebrow="Topshiriq"
        title="Yangi topshiriq"
        description="Ball, muddat va ixtiyoriy guruh. CODE uchun keyin avto-test qo‘shing."
      />
      <Panel className="max-w-2xl">
        {topics.length ? (
          <CreateAssignmentForm
            topics={topics}
            cohorts={cohorts}
            defaultTopicId={topicId}
          />
        ) : (
          <p className="text-sm text-[var(--muted)]">
            Avval kamida bitta mavzu yarating.
          </p>
        )}
      </Panel>
    </>
  );
}
