import Link from "next/link";
import { EmptyState, PageIntro, Panel, StatusTag } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function TeacherTopicsPage() {
  const user = await requireUser(Role.TEACHER);
  if (!user) return null;

  const topics = await prisma.topic.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { assignments: true, questions: true } } },
  });

  return (
    <>
      <PageIntro
        eyebrow="Kontent"
        title="Mavzular"
        description="Mavzularni ko‘ring, tahrirlang yoki yangisini joylang."
        action={
          <Link
            href="/teacher/topics/new"
            className="rounded-[6px] bg-[var(--btn-bg)] px-4 py-2.5 text-sm font-medium text-[var(--btn-fg)] transition hover:bg-[var(--btn-hover)]"
          >
            Yangi mavzu
          </Link>
        }
      />

      {topics.length ? (
        <div className="space-y-3">
          {topics.map((topic, index) => (
            <Link key={topic.id} href={`/teacher/topics/${topic.id}`}>
              <Panel
                index={index}
                className="mb-3 !p-5 transition hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="font-medium text-[var(--ink)]">{topic.title}</h2>
                  <div className="flex flex-wrap gap-2">
                    <StatusTag tone="neutral">
                      {topic._count.assignments} topshiriq
                    </StatusTag>
                    {topic._count.questions > 0 ? (
                      <StatusTag tone="blue">
                        {topic._count.questions} savol
                      </StatusTag>
                    ) : null}
                  </div>
                </div>
                <p className="mt-1 text-sm text-[var(--muted)] line-clamp-2">
                  {topic.summary}
                </p>
                <p className="mt-3 font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                  {formatDate(topic.createdAt)}
                </p>
              </Panel>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Hali mavzu yo‘q"
          description="Birinchi mavzuni joylang — o‘quvchilar bildirishnoma oladi."
        />
      )}
    </>
  );
}
