import Link from "next/link";
import { EmptyState, PageIntro, Panel, StatusTag } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate, formatRelative } from "@/lib/format";
import {
  countPendingSubmissions,
  listTeacherSubmissions,
} from "@/lib/submissions-queue";
import { Role } from "@prisma/client";

export default async function TeacherSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; done?: string }>;
}) {
  const user = await requireUser(Role.TEACHER);
  if (!user) return null;

  const { status: statusRaw, done } = await searchParams;
  const status =
    statusRaw === "pending" || statusRaw === "reviewed" ? statusRaw : "all";

  const [items, pendingCount] = await Promise.all([
    listTeacherSubmissions(user.id, { status }),
    countPendingSubmissions(user.id),
  ]);

  const firstPending = items.find((i) => i.status !== "REVIEWED");

  return (
    <>
      <PageIntro
        eyebrow="Tekshiruv"
        title="Javoblar"
        description="Barcha o‘quvchi javoblari. Baholab, «Keyingisi» orqali navbatdagi javobga o‘ting."
        action={
          firstPending ? (
            <Link
              href={`/teacher/submissions/${firstPending.id}`}
              className="rounded-[6px] bg-[var(--btn-bg)] px-4 py-2.5 text-sm font-medium text-[var(--btn-fg)]"
            >
              Tekshirishni boshlash
              {pendingCount ? ` (${pendingCount})` : ""}
            </Link>
          ) : null
        }
      />

      {done ? (
        <Panel className="mb-6 !py-4">
          <p className="text-sm text-[#346538]">
            Navbatdagi yangi javoblar tugadi. Pastdan qayta ko‘rib chiqishingiz
            mumkin.
          </p>
        </Panel>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ["all", "Hammasi"],
            ["pending", "Yangi"],
            ["reviewed", "Baholangan"],
          ] as const
        ).map(([key, label]) => (
          <Link key={key} href={`/teacher/submissions?status=${key}`}>
            <StatusTag tone={status === key ? "blue" : "neutral"}>
              {label}
              {key === "pending" && pendingCount ? ` · ${pendingCount}` : ""}
            </StatusTag>
          </Link>
        ))}
      </div>

      {items.length ? (
        <div className="space-y-3">
          {items.map((item, index) => {
            const pending = item.status !== "REVIEWED";
            return (
              <Link key={item.id} href={`/teacher/submissions/${item.id}`}>
                <Panel
                  index={index}
                  className="mb-3 !p-5 transition hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-medium text-[var(--ink)]">
                        {item.student.name}
                      </h2>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {item.assignment.title}
                        <span className="text-[var(--muted)]">
                          {" "}
                          · {item.assignment.topic.title}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusTag tone={item.kind === "CODE" ? "blue" : "neutral"}>
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
                    {item.assignment.cohort
                      ? ` · ${item.assignment.cohort.name}`
                      : ""}
                  </p>
                </Panel>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={
            status === "pending" ? "Yangi javob yo‘q" : "Javoblar yo‘q"
          }
          description={
            status === "pending"
              ? "O‘quvchilar yangi topshiriq yuborganida shu yerda chiqadi."
              : "Hali hech kim javob yubormagan."
          }
        />
      )}
    </>
  );
}
