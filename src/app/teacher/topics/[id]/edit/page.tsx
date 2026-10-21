import Link from "next/link";
import { notFound } from "next/navigation";
import { CreateTopicForm, DeleteTopicForm } from "@/components/forms";
import { PageIntro, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function EditTopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser(Role.TEACHER);
  if (!user) return null;

  const { id } = await params;
  const [topic, cohorts] = await Promise.all([
    prisma.topic.findUnique({ where: { id } }),
    prisma.cohort.findMany({
      where: { authorId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!topic || topic.authorId !== user.id) notFound();

  return (
    <>
      <PageIntro
        eyebrow="Tahrirlash"
        title="Mavzuni yangilash"
        description="O‘zgarishlar o‘quvchi sahifasida darhol ko‘rinadi."
        action={
          <Link
            href={`/teacher/topics/${topic.id}`}
            className="rounded-[6px] border border-[var(--line)] bg-[var(--btn-secondary-bg)] px-4 py-2.5 text-sm font-medium text-[var(--btn-secondary-fg)]"
          >
            Orqaga
          </Link>
        }
      />
      <Panel className="mb-6 max-w-2xl">
        <CreateTopicForm
          topicId={topic.id}
          cohorts={cohorts}
          defaults={{
            title: topic.title,
            summary: topic.summary,
            content: topic.content,
            resourceUrl: topic.resourceUrl,
            cohortId: topic.cohortId,
          }}
        />
      </Panel>
      <Panel className="max-w-2xl !py-5">
        <p className="mb-4 text-sm text-[var(--muted)]">
          O‘chirish bilan bog‘liq topshiriqlar va savollar ham yo‘qoladi.
        </p>
        <DeleteTopicForm topicId={topic.id} />
      </Panel>
    </>
  );
}
