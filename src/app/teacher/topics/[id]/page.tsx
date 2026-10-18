import Link from "next/link";
import { notFound } from "next/navigation";
import { AnswerQuestionForm } from "@/components/student-forms";
import { PageIntro, Panel, StatusTag } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function TeacherTopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const topic = await prisma.topic.findUnique({
    where: { id },
    include: {
      assignments: { orderBy: { createdAt: "desc" } },
      questions: {
        include: { student: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!topic) notFound();

  return (
    <>
      <PageIntro
        eyebrow="Mavzu"
        title={topic.title}
        description={topic.summary}
        action={
          <Link
            href={`/teacher/assignments/new?topicId=${topic.id}`}
            className="rounded-[6px] bg-[var(--btn-bg)] px-4 py-2.5 text-sm font-medium text-[var(--btn-fg)]"
          >
            Topshiriq qo‘shish
          </Link>
        }
      />

      {topic.resourceUrl ? (
        <Panel className="mb-8 !py-5">
          <p className="text-xs uppercase tracking-[0.06em] text-[var(--muted)]">
            Resurs
          </p>
          <a
            href={topic.resourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block break-all font-[family-name:var(--font-mono)] text-sm text-[var(--ink)] underline-offset-4 hover:underline"
          >
            {topic.resourceUrl}
          </a>
        </Panel>
      ) : null}

      <Panel className="mb-8">
        <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
          {formatDate(topic.createdAt)}
        </p>
        <div className="prose-kurs mt-4 text-[15px]">{topic.content}</div>
      </Panel>

      <h2 className="mb-4 text-lg font-medium">Shu mavzu topshiriqlari</h2>
      <div className="mb-10 space-y-3">
        {topic.assignments.map((item, index) => (
          <Link key={item.id} href={`/teacher/assignments/${item.id}`}>
            <Panel index={index} className="mb-3 !p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{item.title}</h3>
                <StatusTag tone="neutral">Topshiriq</StatusTag>
              </div>
              <p className="mt-1 text-sm text-[var(--muted)] line-clamp-2">
                {item.description}
              </p>
            </Panel>
          </Link>
        ))}
      </div>

      <h2 className="mb-4 text-lg font-medium">O‘quvchi savollari</h2>
      <div className="space-y-4">
        {topic.questions.length ? (
          topic.questions.map((q, index) => (
            <Panel key={q.id} index={index}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{q.student.name}</p>
                <StatusTag tone={q.answer ? "green" : "yellow"}>
                  {q.answer ? "Javob berilgan" : "Kutilmoqda"}
                </StatusTag>
              </div>
              <p className="mt-3 text-sm text-[var(--body)]">{q.body}</p>
              {q.answer ? (
                <p className="mt-3 rounded-[8px] bg-[#EDF3EC] px-3 py-2 text-sm text-[#346538]">
                  {q.answer}
                </p>
              ) : (
                <AnswerQuestionForm questionId={q.id} />
              )}
            </Panel>
          ))
        ) : (
          <Panel>
            <p className="text-sm text-[var(--muted)]">Hali savol yo‘q.</p>
          </Panel>
        )}
      </div>
    </>
  );
}
