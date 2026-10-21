import Link from "next/link";
import { EmptyState, PageIntro, Panel, StatusTag } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function TeacherAssignmentsPage() {
  const user = await requireUser(Role.TEACHER);
  if (!user) return null;

  const assignments = await prisma.assignment.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      topic: { select: { id: true, title: true } },
      _count: { select: { submissions: true } },
    },
  });

  return (
    <>
      <PageIntro
        eyebrow="Kontent"
        title="Topshiriqlar"
        description="Topshiriqlarni ko‘ring, muddatni yangilang yoki yangisini bering."
        action={
          <Link
            href="/teacher/assignments/new"
            className="rounded-[6px] bg-[var(--btn-bg)] px-4 py-2.5 text-sm font-medium text-[var(--btn-fg)] transition hover:bg-[var(--btn-hover)]"
          >
            Yangi topshiriq
          </Link>
        }
      />

      {assignments.length ? (
        <div className="space-y-3">
          {assignments.map((item, index) => (
            <Link key={item.id} href={`/teacher/assignments/${item.id}`}>
              <Panel
                index={index}
                className="mb-3 !p-5 transition hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="font-medium text-[var(--ink)]">{item.title}</h2>
                  <StatusTag tone="neutral">
                    {item._count.submissions} javob
                  </StatusTag>
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {item.topic.title}
                  {item.dueAt ? ` · Muddat: ${formatDate(item.dueAt)}` : ""}
                </p>
                <p className="mt-3 line-clamp-2 text-sm text-[var(--body)]">
                  {item.description}
                </p>
              </Panel>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Hali topshiriq yo‘q"
          description="Avval mavzu yarating, so‘ng topshiriq bering."
        />
      )}
    </>
  );
}
