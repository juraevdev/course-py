import Link from "next/link";
import { notFound } from "next/navigation";
import { AskQuestionForm } from "@/components/student-forms";
import { DownloadTopicButton } from "@/components/download-topic";
import { MarkTopicViewed } from "@/components/mark-viewed";
import { PageIntro, Panel, StatusTag } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import {
  studentAssignmentWhere,
  studentCanAccessTopic,
} from "@/lib/cohorts";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function StudentTopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser(Role.STUDENT);
  if (!user) return null;

  const { id } = await params;
  const assignmentFilter = await studentAssignmentWhere(user.id);
  const topic = await prisma.topic.findUnique({
    where: { id },
    include: {
      assignments: {
        where: assignmentFilter,
        orderBy: { createdAt: "desc" },
      },
      questions: {
        where: { studentId: user.id },
        orderBy: { createdAt: "desc" },
      },
      notes: {
        where: { studentId: user.id },
        orderBy: { updatedAt: "desc" },
        take: 3,
      },
    },
  });

  if (!topic) notFound();
  const allowed = await studentCanAccessTopic(user.id, topic);
  if (!allowed) notFound();

  return (
    <>
      <MarkTopicViewed topicId={topic.id} />
      <PageIntro
        eyebrow="Mavzu"
        title={topic.title}
        description={topic.summary}
        action={
          <DownloadTopicButton
            title={topic.title}
            summary={topic.summary}
            content={topic.content}
            resourceUrl={topic.resourceUrl}
          />
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

      {topic.assignments.length ? (
        <>
          <h2 className="mb-4 text-lg font-medium">Topshiriqlar</h2>
          <div className="mb-8 space-y-3">
            {topic.assignments.map((item, index) => (
              <Link key={item.id} href={`/student/assignments/${item.id}`}>
                <Panel index={index} className="mb-3 !p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{item.title}</h3>
                    <StatusTag tone="blue">Bajarish</StatusTag>
                  </div>
                </Panel>
              </Link>
            ))}
          </div>
        </>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-4 text-lg font-medium">Savol berish</h2>
          <AskQuestionForm topicId={topic.id} />
          {topic.questions.length ? (
            <div className="mt-6 space-y-4 border-t border-[var(--line)] pt-5">
              {topic.questions.map((q) => (
                <div key={q.id}>
                  <p className="text-sm text-[var(--body)]">{q.body}</p>
                  {q.answer ? (
                    <p className="mt-2 rounded-[8px] bg-[#EDF3EC] px-3 py-2 text-sm text-[#346538]">
                      Javob: {q.answer}
                    </p>
                  ) : (
                    <StatusTag tone="yellow">Javob kutilmoqda</StatusTag>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </Panel>

        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Eslatmalarim</h2>
            <Link
              href={`/student/notes?topicId=${topic.id}`}
              className="text-sm text-[var(--muted)] underline-offset-4 hover:underline"
            >
              Yangi
            </Link>
          </div>
          {topic.notes.length ? (
            <div className="space-y-3">
              {topic.notes.map((note) => (
                <div key={note.id} className="border-b border-[var(--line)] pb-3 last:border-0">
                  <p className="font-medium text-[var(--ink)]">{note.title}</p>
                  <p className="mt-1 text-sm text-[var(--muted)] line-clamp-3">
                    {note.body}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              Bu mavzu bo‘yicha hali eslatma yo‘q.
            </p>
          )}
        </Panel>
      </div>
    </>
  );
}
