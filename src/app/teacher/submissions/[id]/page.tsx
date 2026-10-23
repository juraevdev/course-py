import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewQueueForm } from "@/components/review-queue-form";
import { TestReportList } from "@/components/test-report";
import { PageIntro, Panel, StatusTag } from "@/components/ui";
import { parseTestReport } from "@/lib/autograde";
import { requireUser } from "@/lib/auth";
import { formatDate, formatRelative } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import {
  countPendingSubmissions,
  findNextPendingSubmission,
} from "@/lib/submissions-queue";
import { Role } from "@prisma/client";

export default async function TeacherSubmissionReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser(Role.TEACHER);
  if (!user) return null;

  const { id } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      student: true,
      assignment: {
        include: {
          topic: true,
          cohort: true,
        },
      },
    },
  });

  if (!submission || submission.assignment.authorId !== user.id) notFound();

  const [next, pendingCount] = await Promise.all([
    findNextPendingSubmission(user.id, submission.id),
    countPendingSubmissions(user.id),
  ]);

  const queueNextHref = next ? `/teacher/submissions/${next.id}` : null;

  const report = parseTestReport(submission.testReport);

  return (
    <>
      <PageIntro
        eyebrow="Tekshiruv"
        title={submission.student.name}
        description={`${submission.assignment.title} · ${submission.assignment.topic.title}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/teacher/submissions"
              className="rounded-[6px] border border-[var(--line)] bg-[var(--btn-secondary-bg)] px-4 py-2.5 text-sm font-medium"
            >
              Ro‘yxat
              {pendingCount ? ` · ${pendingCount} yangi` : ""}
            </Link>
            <Link
              href={`/teacher/assignments/${submission.assignmentId}`}
              className="rounded-[6px] border border-[var(--line)] bg-[var(--btn-secondary-bg)] px-4 py-2.5 text-sm font-medium"
            >
              Topshiriq
            </Link>
          </div>
        }
      />

      <Panel className="mb-6 !py-4">
        <div className="flex flex-wrap gap-2 text-sm">
          <StatusTag tone={submission.kind === "CODE" ? "blue" : "neutral"}>
            {submission.kind === "CODE" ? "Python" : "Matn"}
          </StatusTag>
          <StatusTag
            tone={submission.status === "REVIEWED" ? "green" : "yellow"}
          >
            {submission.status === "REVIEWED" ? "Baholangan" : "Kutilmoqda"}
          </StatusTag>
          {submission.assignment.cohort ? (
            <StatusTag tone="blue">{submission.assignment.cohort.name}</StatusTag>
          ) : null}
          <span className="text-[var(--muted)]">
            {formatRelative(submission.createdAt)} ·{" "}
            {formatDate(submission.createdAt)}
          </span>
        </div>
      </Panel>

      <Panel className="mb-8">
        <p className="text-xs uppercase tracking-[0.06em] text-[var(--muted)]">
          Topshiriq sharti
        </p>
        <h2 className="mt-2 text-lg font-medium text-[var(--ink)]">
          {submission.assignment.title}
        </h2>
        <div className="prose-kurs mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--body)]">
          {submission.assignment.description}
        </div>
        {submission.assignment.dueAt ? (
          <p className="mt-4 font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
            Muddat: {formatDate(submission.assignment.dueAt)}
          </p>
        ) : null}
      </Panel>

      <div className="grid gap-8 lg:grid-cols-5">
        <Panel className="lg:col-span-3">
          <h2 className="mb-4 text-lg font-medium">Javob</h2>
          {submission.kind === "CODE" ? (
            <pre className="prose-kurs overflow-x-auto rounded-[8px] bg-[var(--canvas)] p-4 font-[family-name:var(--font-mono)] text-[13px]">
              {submission.content}
            </pre>
          ) : (
            <p className="prose-kurs whitespace-pre-wrap text-sm leading-relaxed text-[var(--body)]">
              {submission.content}
            </p>
          )}
          {submission.fileName && submission.filePath ? (
            <a
              href={`/api/files/${submission.id}`}
              className="mt-4 inline-block text-sm text-[var(--muted)] underline-offset-4 hover:underline"
            >
              Fayl: {submission.fileName}
            </a>
          ) : null}
          {report.length ? (
            <div className="mt-6 border-t border-[var(--line)] pt-5">
              <h3 className="mb-3 text-sm font-medium">Avto-test</h3>
              <TestReportList
                report={report}
                maxScore={submission.assignment.maxScore}
                score={submission.autoScore}
              />
            </div>
          ) : null}
        </Panel>

        <Panel className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-medium">Baholash</h2>
          <p className="mb-4 text-sm text-[var(--muted)]">
            Ball: −{submission.assignment.maxScore}…{submission.assignment.maxScore}.
            Saqlagach «Keyingisi» chiqadi.
          </p>
          <ReviewQueueForm
            submissionId={submission.id}
            maxScore={submission.assignment.maxScore}
            defaultScore={submission.score ?? submission.autoScore}
            defaultFeedback={submission.feedback}
            nextHref={queueNextHref}
          />
        </Panel>
      </div>
    </>
  );
}
