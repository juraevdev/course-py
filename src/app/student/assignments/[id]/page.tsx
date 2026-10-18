import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeSubmitForm } from "@/components/code-submit";
import { PageIntro, Panel, StatusTag } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function StudentAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser(Role.STUDENT);
  if (!user) return null;

  const { id } = await params;
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      topic: true,
      submissions: { where: { studentId: user.id } },
    },
  });

  if (!assignment) notFound();
  const submission = assignment.submissions[0];

  return (
    <>
      <PageIntro
        eyebrow="Topshiriq"
        title={assignment.title}
        description={assignment.description}
      />

      <Panel className="mb-8">
        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
          <Link
            href={`/student/topics/${assignment.topicId}`}
            className="underline-offset-4 hover:underline"
          >
            Mavzu: {assignment.topic.title}
          </Link>
          {assignment.dueAt ? (
            <span>Muddat: {formatDate(assignment.dueAt)}</span>
          ) : null}
          {submission ? (
            <StatusTag
              tone={submission.status === "REVIEWED" ? "green" : "blue"}
            >
              {submission.status === "REVIEWED" ? "Ko‘rilgan" : "Yuborilgan"}
            </StatusTag>
          ) : (
            <StatusTag tone="yellow">Kutilmoqda</StatusTag>
          )}
        </div>
      </Panel>

      {submission?.feedback ? (
        <Panel className="mb-8">
          <p className="text-xs uppercase tracking-[0.06em] text-[#346538]">
            O‘qituvchi izohi
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--body)]">
            {submission.feedback}
          </p>
          <Link
            href="/student/feedback"
            className="mt-3 inline-block text-sm text-[var(--muted)] underline-offset-4 hover:underline"
          >
            Barcha izohlar
          </Link>
        </Panel>
      ) : null}

      <Panel className="max-w-3xl">
        <h2 className="mb-4 text-lg font-medium">Javobingiz</h2>
        <CodeSubmitForm
          assignmentId={assignment.id}
          defaultValue={submission?.content}
          defaultKind={submission?.kind}
          fileName={submission?.fileName}
        />
      </Panel>
    </>
  );
}
