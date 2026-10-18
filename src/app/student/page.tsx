import Link from "next/link";
import { EmptyState, PageIntro, Panel, StatusTag } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function StudentHomePage() {
  const user = await requireUser(Role.STUDENT);
  if (!user) return null;

  const now = new Date();
  const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const [
    topics,
    assignments,
    unread,
    topicTotal,
    viewedCount,
    assignmentTotal,
    submittedCount,
    upcoming,
  ] = await Promise.all([
    prisma.topic.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { views: { where: { userId: user.id } } },
    }),
    prisma.assignment.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        submissions: { where: { studentId: user.id } },
        topic: true,
      },
    }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
    prisma.topic.count(),
    prisma.topicView.count({ where: { userId: user.id } }),
    prisma.assignment.count(),
    prisma.submission.count({ where: { studentId: user.id } }),
    prisma.assignment.findMany({
      where: {
        dueAt: { gte: now, lte: inThreeDays },
        NOT: { submissions: { some: { studentId: user.id } } },
      },
      orderBy: { dueAt: "asc" },
      include: { topic: true },
    }),
  ]);

  const topicPct = topicTotal ? Math.round((viewedCount / topicTotal) * 100) : 0;
  const assignPct = assignmentTotal
    ? Math.round((submittedCount / assignmentTotal) * 100)
    : 0;

  return (
    <>
      <PageIntro
        eyebrow="O‘quvchi profili"
        title={user.name}
        description="Offline dasturlash darsidagi mavzular, kod resurslari va topshiriqlar shu yerda."
      />

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <Panel className="!p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.06em] text-[var(--muted)]">
              Mavzular progressi
            </p>
            <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
              {viewedCount}/{topicTotal}
            </span>
          </div>
          <p className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-[-0.03em]">
            {topicPct}%
          </p>
          <div className="progress-bar mt-4">
            <span style={{ width: `${topicPct}%` }} />
          </div>
        </Panel>
        <Panel className="!p-5" index={1}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.06em] text-[var(--muted)]">
              Topshiriqlar progressi
            </p>
            <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
              {submittedCount}/{assignmentTotal}
            </span>
          </div>
          <p className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-[-0.03em]">
            {assignPct}%
          </p>
          <div className="progress-bar mt-4">
            <span style={{ width: `${assignPct}%` }} />
          </div>
        </Panel>
      </div>

      {upcoming.length ? (
        <Panel className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Yaqin muddatlar</h2>
            <StatusTag tone="yellow">3 kun ichida</StatusTag>
          </div>
          <div className="space-y-3">
            {upcoming.map((item) => (
              <Link
                key={item.id}
                href={`/student/assignments/${item.id}`}
                className="flex items-center justify-between gap-3 border-b border-[var(--line)] py-3 last:border-0"
              >
                <div>
                  <p className="font-medium text-[var(--ink)]">{item.title}</p>
                  <p className="text-sm text-[var(--muted)]">{item.topic.title}</p>
                </div>
                <p className="shrink-0 font-[family-name:var(--font-mono)] text-xs text-[#956400]">
                  {formatDate(item.dueAt)}
                </p>
              </Link>
            ))}
          </div>
        </Panel>
      ) : null}

      {unread > 0 ? (
        <Panel className="mb-8 !py-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--body)]">
              Sizda {unread} ta o‘qilmagan bildirishnoma bor.
            </p>
            <Link
              href="/student/notifications"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              Ochish
            </Link>
          </div>
        </Panel>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-[var(--ink)]">Mavzular</h2>
            <Link href="/student/topics" className="text-sm text-[var(--muted)]">
              Barchasi
            </Link>
          </div>
          {topics.length ? (
            <div className="space-y-3">
              {topics.map((topic, index) => (
                <Link key={topic.id} href={`/student/topics/${topic.id}`}>
                  <Panel
                    index={index}
                    className="mb-3 !p-5 transition hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-[var(--ink)]">
                        {topic.title}
                      </h3>
                      <StatusTag tone={topic.views.length ? "green" : "blue"}>
                        {topic.views.length ? "Ko‘rilgan" : "Yangi"}
                      </StatusTag>
                    </div>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {topic.summary}
                    </p>
                  </Panel>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Mavzu hali yo‘q"
              description="O‘qituvchi yangi mavzu joylaganda bu yerda chiqadi."
            />
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-[var(--ink)]">Topshiriqlar</h2>
            <Link
              href="/student/assignments"
              className="text-sm text-[var(--muted)]"
            >
              Barchasi
            </Link>
          </div>
          {assignments.length ? (
            <div className="space-y-3">
              {assignments.map((item, index) => {
                const done = item.submissions[0];
                return (
                  <Link key={item.id} href={`/student/assignments/${item.id}`}>
                    <Panel index={index} className="mb-3 !p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-medium text-[var(--ink)]">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {item.topic.title}
                          </p>
                        </div>
                        <StatusTag tone={done ? "green" : "yellow"}>
                          {done
                            ? done.status === "REVIEWED"
                              ? "Ko‘rilgan"
                              : "Yuborilgan"
                            : "Kutilmoqda"}
                        </StatusTag>
                      </div>
                      {item.dueAt ? (
                        <p className="mt-3 font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                          Muddat: {formatDate(item.dueAt)}
                        </p>
                      ) : null}
                    </Panel>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Topshiriq yo‘q"
              description="Yangi topshiriq chiqqanda bildirishnoma keladi."
            />
          )}
        </section>
      </div>
    </>
  );
}
