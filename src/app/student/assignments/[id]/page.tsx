import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeSubmitForm } from "@/components/code-submit";
import { TestReportList } from "@/components/test-report";
import { PageIntro, Panel, StatusTag } from "@/components/ui";
import { parseTestReport, publicTestReport } from "@/lib/autograde";
import { requireUser } from "@/lib/auth";
import { studentCanAccessAssignment } from "@/lib/cohorts";
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
      cohort: true,
      _count: { select: { tests: true } },
      submissions: { where: { studentId: user.id } },
    },
  });

  if (!assignment) notFound();
  const allowed = await studentCanAccessAssignment(user.id, assignment);
  if (!allowed) notFound();

  const submission = assignment.submissions[0];
  const report = publicTestReport(parseTestReport(submission?.testReport));

  return (
    <>
      <PageIntro
        eyebrow="Topshiriq"
        title={assignment.title}
        description={`Mavzu: ${assignment.topic.title}`}
      />

      <Panel className="mb-8">
        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
          <Link
            href={`/student/topics/${assignment.topicId}`}
            className="underline-offset-4 hover:underline"
          >
            Mavzu: {assignment.topic.title}
          </Link>
          {assignment.cohort ? (
            <StatusTag tone="blue">{assignment.cohort.name}</StatusTag>
          ) : null}
          <StatusTag tone="yellow">Max {assignment.maxScore} ball</StatusTag>
          {assignment._count.tests > 0 ? (
            <StatusTag tone="blue">
              {assignment._count.tests} avto-test
            </StatusTag>
          ) : null}
          {assignment.dueAt ? (
            <span>Muddat: {formatDate(assignment.dueAt)}</span>
          ) : null}
          {submission?.score != null ? (
            <StatusTag tone="green">
              {submission.score}/{assignment.maxScore} ball
            </StatusTag>
          ) : submission ? (
            <StatusTag
              tone={submission.status === "REVIEWED" ? "green" : "blue"}
            >
              {submission.status === "REVIEWED" ? "Ko‘rilgan" : "Yuborilgan"}
            </StatusTag>
          ) : (
            <StatusTag tone="yellow">Kutilmoqda</StatusTag>
          )}
        </div>
        <div className="prose-kurs mt-5 border-t border-[var(--line)] pt-5 text-sm text-[var(--body)]">
          {assignment.description}
        </div>
      </Panel>

      {report.length ? (
        <Panel className="mb-8">
          <h2 className="mb-4 text-lg font-medium">Avto-test natijasi</h2>
          <TestReportList
            report={report}
            maxScore={assignment.maxScore}
            score={submission?.autoScore}
          />
          <Link
            href="/student/leaderboard"
            className="mt-4 inline-block text-sm text-[var(--muted)] underline-offset-4 hover:underline"
          >
            Reytingni ko‘rish
          </Link>
        </Panel>
      ) : null}

      {submission?.feedback ? (
        <Panel className="mb-8">
          <p className="text-xs uppercase tracking-[0.06em] text-[#346538]">
            O‘qituvchi izohi
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--body)]">
            {submission.feedback}
          </p>
          {submission.score != null ? (
            <p className="mt-2 font-[family-name:var(--font-mono)] text-sm text-[var(--ink)]">
              Ball: {submission.score}/{assignment.maxScore}
            </p>
          ) : null}
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
        {assignment._count.tests > 0 ? (
          <p className="mb-4 text-sm text-[var(--muted)]">
            CODE yuborsangiz, yashirin testlar avtomatik ishga tushadi va ball
            hisoblanadi.
          </p>
        ) : null}
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
