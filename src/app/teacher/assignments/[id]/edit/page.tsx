import Link from "next/link";
import { notFound } from "next/navigation";
import { CreateAssignmentForm, DeleteAssignmentForm } from "@/components/forms";
import { PageIntro, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { toDateInputValue } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function EditAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser(Role.TEACHER);
  if (!user) return null;

  const { id } = await params;
  const [assignment, topics, cohorts] = await Promise.all([
    prisma.assignment.findUnique({ where: { id } }),
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

  if (!assignment || assignment.authorId !== user.id) notFound();

  return (
    <>
      <PageIntro
        eyebrow="Tahrirlash"
        title="Topshiriqni yangilash"
        description="Muddat, ball, guruh yoki tavsifni o‘zgartirish mumkin."
        action={
          <Link
            href={`/teacher/assignments/${assignment.id}`}
            className="rounded-[6px] border border-[var(--line)] bg-[var(--btn-secondary-bg)] px-4 py-2.5 text-sm font-medium text-[var(--btn-secondary-fg)]"
          >
            Orqaga
          </Link>
        }
      />
      <Panel className="mb-6 max-w-2xl">
        <CreateAssignmentForm
          assignmentId={assignment.id}
          topics={topics}
          cohorts={cohorts}
          defaultTopicId={assignment.topicId}
          defaults={{
            title: assignment.title,
            description: assignment.description,
            dueAt: toDateInputValue(assignment.dueAt),
            cohortId: assignment.cohortId,
            maxScore: assignment.maxScore,
          }}
        />
      </Panel>
      <Panel className="max-w-2xl !py-5">
        <p className="mb-4 text-sm text-[var(--muted)]">
          O‘chirish bilan o‘quvchi javoblari ham yo‘qoladi.
        </p>
        <DeleteAssignmentForm assignmentId={assignment.id} />
      </Panel>
    </>
  );
}
