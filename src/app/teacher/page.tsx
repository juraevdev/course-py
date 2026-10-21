import Link from "next/link";
import { EmptyState, PageIntro, Panel, StatusTag } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate, formatRelative } from "@/lib/format";
import {
  countPendingSubmissions,
  listTeacherSubmissions,
} from "@/lib/submissions-queue";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function TeacherHomePage() {
  const user = await requireUser(Role.TEACHER);
  if (!user) return null;

  const [pendingCount, submissions, unread] = await Promise.all([
    countPendingSubmissions(user.id),
    listTeacherSubmissions(user.id, { status: "all" }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
  ]);

  const queue = submissions.slice(0, 20);
  const firstPending = submissions.find((i) => i.status !== "REVIEWED");

  return (
    <>
      <PageIntro
        eyebrow="O‘qituvchi"
        title={
          pendingCount
            ? `${pendingCount} ta javob kutilmoqda`
            : `Salom, ${user.name.split(" ")[0]}`
        }
        description={
          pendingCount
            ? "Baholang — so‘ng «Keyingisi» bilan navbatdagi javobga o‘ting."
            : "Yangi javob kelganda shu yerda chiqadi. Mavzu va topshiriq menyudan."
        }
        action={
          <div className="flex flex-wrap gap-2">
            {firstPending ? (
              <Link
                href={`/teacher/submissions/${firstPending.id}`}
                className="rounded-[6px] bg-[var(--btn-bg)] px-4 py-2.5 text-sm font-medium text-[var(--btn-fg)]"
              >
                Tekshirishni boshlash
              </Link>
            ) : null}
            <Link
              href="/teacher/submissions"
              className="rounded-[6px] border border-[var(--line)] bg-[var(--btn-secondary-bg)] px-4 py-2.5 text-sm font-medium"
            >
              Barcha javoblar
            </Link>
          </div>
        }
      />

      {unread > 0 ? (
        <Panel className="mb-6 !py-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-[var(--body)]">
              <StatusTag tone="blue">{unread} yangi</StatusTag>
              <span className="ml-3">bildirishnoma.</span>
            </p>
            <Link
              href="/teacher/notifications"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              Ko‘rish
            </Link>
          </div>
        </Panel>
      ) : null}

      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-medium text-[var(--ink)]">Javoblar</h2>
        <Link
          href="/teacher/submissions?status=pending"
          className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)] underline-offset-4 hover:underline"
        >
          {pendingCount} yangi · hammasi
        </Link>
      </div>

      {queue.length ? (
        <div className="space-y-3">
          {queue.map((item, index) => {
            const pending = item.status !== "REVIEWED";
            return (
              <Link key={item.id} href={`/teacher/submissions/${item.id}`}>
                <Panel
                  index={index}
                  className="mb-3 !p-5 transition hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-[var(--ink)]">
                        {item.student.name}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {item.assignment.title}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusTag
                        tone={item.kind === "CODE" ? "blue" : "neutral"}
                      >
                        {item.kind === "CODE" ? "Python" : "Matn"}
                      </StatusTag>
                      {item.score != null ? (
                        <StatusTag tone="green">
                          {item.score}/{item.assignment.maxScore}
                        </StatusTag>
                      ) : null}
                      <StatusTag tone={pending ? "yellow" : "green"}>
                        {pending ? "Kutilmoqda" : "Baholangan"}
                      </StatusTag>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-[var(--body)]">
                    {item.content}
                  </p>
                  <p className="mt-3 font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                    {formatRelative(item.createdAt)} ·{" "}
                    {formatDate(item.createdAt)}
                  </p>
                </Panel>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Javoblar yo‘q"
          description="O‘quvchilar topshiriq yuborganida bu yerda chiqadi."
        />
      )}
    </>
  );
}
