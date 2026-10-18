import Link from "next/link";
import { BookOpen, ClipboardText, Users } from "@phosphor-icons/react/dist/ssr";
import { EmptyState, PageIntro, Panel, StatusTag } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function TeacherHomePage() {
  const user = await requireUser(Role.TEACHER);
  if (!user) return null;

  const [topics, assignments, students, unread, recentSubmissions] =
    await Promise.all([
      prisma.topic.count({ where: { authorId: user.id } }),
      prisma.assignment.count({ where: { authorId: user.id } }),
      prisma.user.count({ where: { role: Role.STUDENT } }),
      prisma.notification.count({ where: { userId: user.id, read: false } }),
      prisma.submission.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          student: true,
          assignment: true,
        },
      }),
    ]);

  const latestTopics = await prisma.topic.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return (
    <>
      <PageIntro
        eyebrow="O‘qituvchi"
        title={`Salom, ${user.name.split(" ")[0]}`}
        description="Yangi mavzu, kod misollari yoki topshiriq joylang — o‘quvchilarga bildirishnoma boradi. Offline dasturlash darsining qo‘shimchasi shu yerda."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/teacher/topics/new"
              className="rounded-[6px] bg-[var(--btn-bg)] px-4 py-2.5 text-sm font-medium text-[var(--btn-fg)] transition hover:bg-[var(--btn-hover)]"
            >
              Yangi mavzu
            </Link>
            <Link
              href="/teacher/assignments/new"
              className="rounded-[6px] border border-[var(--line)] bg-[var(--btn-secondary-bg)] px-4 py-2.5 text-sm font-medium text-[var(--btn-secondary-fg)] transition hover:bg-[var(--btn-secondary-hover)]"
            >
              Yangi topshiriq
            </Link>
            <Link
              href="/teacher/students"
              className="rounded-[6px] border border-[var(--line)] bg-[var(--btn-secondary-bg)] px-4 py-2.5 text-sm font-medium text-[var(--btn-secondary-fg)] transition hover:bg-[var(--btn-secondary-hover)]"
            >
              O‘quvchilar
            </Link>
          </div>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Mavzular", value: topics, icon: BookOpen },
          { label: "Topshiriqlar", value: assignments, icon: ClipboardText },
          { label: "O‘quvchilar", value: students, icon: Users },
        ].map((item, index) => (
          <Panel key={item.label} index={index} className="!p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.06em] text-[var(--muted)]">
                {item.label}
              </p>
              <item.icon weight="bold" size={18} className="text-[var(--muted)]" />
            </div>
            <p className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-[-0.03em] text-[var(--ink)]">
              {item.value}
            </p>
          </Panel>
        ))}
      </div>

      {unread > 0 ? (
        <Panel className="mb-8 !py-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-[var(--body)]">
              <StatusTag tone="blue">{unread} yangi</StatusTag>
              <span className="ml-3">bildirishnoma kutilyapti.</span>
            </p>
            <Link
              href="/teacher/notifications"
              className="text-sm font-medium text-[var(--ink)] underline-offset-4 hover:underline"
            >
              Ko‘rish
            </Link>
          </div>
        </Panel>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-medium text-[var(--ink)]">
            So‘nggi mavzular
          </h2>
          {latestTopics.length ? (
            <div className="space-y-3">
              {latestTopics.map((topic, index) => (
                <Link key={topic.id} href={`/teacher/topics/${topic.id}`}>
                  <Panel index={index} className="mb-3 !p-5 transition hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                    <h3 className="font-medium text-[var(--ink)]">{topic.title}</h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">{topic.summary}</p>
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
        </div>

        <div>
          <h2 className="mb-4 text-lg font-medium text-[var(--ink)]">
            Yangi javoblar
          </h2>
          {recentSubmissions.length ? (
            <div className="space-y-3">
              {recentSubmissions.map((item, index) => (
                <Link
                  key={item.id}
                  href={`/teacher/assignments/${item.assignmentId}`}
                >
                  <Panel index={index} className="mb-3 !p-5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium text-[var(--ink)]">
                        {item.student.name}
                      </h3>
                      <StatusTag
                        tone={item.status === "REVIEWED" ? "green" : "yellow"}
                      >
                        {item.status === "REVIEWED" ? "Ko‘rilgan" : "Yangi"}
                      </StatusTag>
                    </div>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {item.assignment.title}
                    </p>
                  </Panel>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Javoblar yo‘q"
              description="O‘quvchilar topshiriq yuborganida bu yerda chiqadi."
            />
          )}
        </div>
      </div>
    </>
  );
}
