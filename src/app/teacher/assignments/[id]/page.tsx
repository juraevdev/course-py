import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CreateAssignmentTestForm,
  DeleteAssignmentTestForm,
} from "@/components/competition-forms";
import { ReviewForm } from "@/components/forms";
import { TestReportList } from "@/components/test-report";
import { PageIntro, Panel, StatusTag } from "@/components/ui";
import { parseTestReport } from "@/lib/autograde";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function TeacherAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser(Role.TEACHER);
  if (!user) return null;

  const { id } = await params;
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      topic: true,
      cohort: true,
      tests: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      submissions: {
        include: { student: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!assignment || assignment.authorId !== user.id) notFound();

  return (
    <>
      <PageIntro
        eyebrow="Topshiriq"
        title={assignment.title}
        description={`Mavzu: ${assignment.topic.title}`}
        action={
          <Link
            href={`/teacher/assignments/${assignment.id}/edit`}
            className="rounded-[6px] border border-[var(--line)] bg-[var(--btn-secondary-bg)] px-4 py-2.5 text-sm font-medium text-[var(--btn-secondary-fg)]"
          >
            Tahrirlash
          </Link>
        }
      />

      <Panel className="mb-8">
        <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
          <Link
            href={`/teacher/topics/${assignment.topicId}`}
            className="underline-offset-4 hover:underline"
          >
            Mavzu: {assignment.topic.title}
          </Link>
          {assignment.cohort ? (
            <StatusTag tone="blue">{assignment.cohort.name}</StatusTag>
          ) : (
            <StatusTag tone="neutral">Barcha</StatusTag>
          )}
          <StatusTag tone="yellow">Max {assignment.maxScore} ball</StatusTag>
          {assignment.dueAt ? (
            <span>Muddat: {formatDate(assignment.dueAt)}</span>
          ) : null}
        </div>
        <div className="prose-kurs mt-5 border-t border-[var(--line)] pt-5 text-sm text-[var(--body)]">
          {assignment.description}
        </div>
      </Panel>

      <div className="mb-10 grid gap-8 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-4 text-lg font-medium">Avto-testlar</h2>
          {assignment.tests.length ? (
            <ul className="mb-6 space-y-3">
              {assignment.tests.map((test) => (
                <li
                  key={test.id}
                  className="rounded-[8px] border border-[var(--line)] px-3 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-[var(--ink)]">{test.name}</p>
                      <p className="mt-1 font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                        {test.points} ball ·{" "}
                        {test.isHidden ? "yashirin" : "ochiq"}
                      </p>
                    </div>
                    <DeleteAssignmentTestForm testId={test.id} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-6 text-sm text-[var(--muted)]">
              Test yo‘q — CODE javoblar avtomatik baholanmaydi.
            </p>
          )}
          <CreateAssignmentTestForm assignmentId={assignment.id} />
        </Panel>

        <div>
          <h2 className="mb-4 text-lg font-medium">O‘quvchi javoblari</h2>
          <div className="space-y-4">
            {assignment.submissions.length ? (
              assignment.submissions.map((item, index) => {
                const report = parseTestReport(item.testReport);
                return (
                  <Panel key={item.id} index={index}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-medium">{item.student.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        <StatusTag
                          tone={item.kind === "CODE" ? "blue" : "neutral"}
                        >
                          {item.kind === "CODE" ? "Python" : "Javob"}
                        </StatusTag>
                        {item.score != null ? (
                          <StatusTag tone="green">
                            {item.score}/{assignment.maxScore}
                          </StatusTag>
                        ) : null}
                        <StatusTag
                          tone={
                            item.status === "REVIEWED" ? "green" : "yellow"
                          }
                        >
                          {item.status === "REVIEWED" ? "Ko‘rilgan" : "Yangi"}
                        </StatusTag>
                      </div>
                    </div>
                    {item.kind === "CODE" ? (
                      <pre className="prose-kurs mt-4 overflow-x-auto rounded-[8px] bg-[var(--canvas)] p-3 font-[family-name:var(--font-mono)] text-[13px]">
                        {item.content}
                      </pre>
                    ) : (
                      <p className="prose-kurs mt-4 text-sm">{item.content}</p>
                    )}
                    {item.fileName && item.filePath ? (
                      <a
                        href={`/api/files/${item.id}`}
                        className="mt-3 inline-block text-sm text-[var(--muted)] underline-offset-4 hover:underline"
                      >
                        Fayl: {item.fileName}
                      </a>
                    ) : null}
                    {report.length ? (
                      <div className="mt-4 border-t border-[var(--line)] pt-4">
                        <TestReportList
                          report={report}
                          maxScore={assignment.maxScore}
                          score={item.autoScore}
                        />
                      </div>
                    ) : null}
                    {item.feedback ? (
                      <p className="mt-4 rounded-[8px] bg-[#EDF3EC] px-3 py-2 text-sm text-[#346538]">
                        Izohingiz: {item.feedback}
                        {item.score != null
                          ? ` · Ball: ${item.score}/${assignment.maxScore}`
                          : ""}
                      </p>
                    ) : null}
                    <div className="mt-5 border-t border-[var(--line)] pt-5">
                      <ReviewForm
                        submissionId={item.id}
                        maxScore={assignment.maxScore}
                        defaultScore={item.score ?? item.autoScore}
                      />
                    </div>
                  </Panel>
                );
              })
            ) : (
              <Panel>
                <p className="text-sm text-[var(--muted)]">
                  Hali hech kim javob yubormagan.
                </p>
              </Panel>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
