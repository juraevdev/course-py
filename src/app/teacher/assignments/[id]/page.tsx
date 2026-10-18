import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/forms";
import { PageIntro, Panel, StatusTag } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function TeacherAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      topic: true,
      submissions: {
        include: { student: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!assignment) notFound();

  return (
    <>
      <PageIntro
        eyebrow="Topshiriq"
        title={assignment.title}
        description={assignment.description}
      />

      <Panel className="mb-8">
        <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
          <Link
            href={`/teacher/topics/${assignment.topicId}`}
            className="underline-offset-4 hover:underline"
          >
            Mavzu: {assignment.topic.title}
          </Link>
          {assignment.dueAt ? (
            <span>Muddat: {formatDate(assignment.dueAt)}</span>
          ) : null}
        </div>
      </Panel>

      <h2 className="mb-4 text-lg font-medium">O‘quvchi javoblari</h2>
      <div className="space-y-4">
        {assignment.submissions.length ? (
          assignment.submissions.map((item, index) => (
            <Panel key={item.id} index={index}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-medium">{item.student.name}</h3>
                <div className="flex flex-wrap gap-2">
                  <StatusTag tone={item.kind === "CODE" ? "blue" : "neutral"}>
                    {item.kind === "CODE" ? "Python" : "Javob"}
                  </StatusTag>
                  <StatusTag tone={item.status === "REVIEWED" ? "green" : "yellow"}>
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
              {item.feedback ? (
                <p className="mt-4 rounded-[8px] bg-[#EDF3EC] px-3 py-2 text-sm text-[#346538]">
                  Izohingiz: {item.feedback}
                </p>
              ) : (
                <div className="mt-5 border-t border-[var(--line)] pt-5">
                  <ReviewForm submissionId={item.id} />
                </div>
              )}
            </Panel>
          ))
        ) : (
          <Panel>
            <p className="text-sm text-[var(--muted)]">
              Hali hech kim javob yubormagan.
            </p>
          </Panel>
        )}
      </div>
    </>
  );
}
