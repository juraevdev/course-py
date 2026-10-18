import { CreateAssignmentForm } from "@/components/forms";
import { PageIntro, Panel } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export default async function NewAssignmentPage({
  searchParams,
}: {
  searchParams: Promise<{ topicId?: string }>;
}) {
  const { topicId } = await searchParams;
  const topics = await prisma.topic.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });

  return (
    <>
      <PageIntro
        eyebrow="Topshiriq"
        title="Yangi topshiriq"
        description="O‘quvchilar bildirishnoma oladi va o‘z hisoblaridan javob yuboradi."
      />
      <Panel className="max-w-2xl">
        {topics.length ? (
          <CreateAssignmentForm topics={topics} defaultTopicId={topicId} />
        ) : (
          <p className="text-sm text-[var(--muted)]">
            Avval kamida bitta mavzu yarating.
          </p>
        )}
      </Panel>
    </>
  );
}
