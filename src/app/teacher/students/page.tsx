import Link from "next/link";
import { CreateStudentForm, ResetPasswordForm } from "@/components/teacher-forms";
import { EmptyState, PageIntro, Panel, StatusTag } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function TeacherStudentsPage() {
  const user = await requireUser(Role.TEACHER);
  if (!user) return null;

  const [students, cohorts] = await Promise.all([
    prisma.user.findMany({
      where: { role: Role.STUDENT },
      orderBy: { createdAt: "desc" },
      include: {
        memberships: {
          include: { cohort: { select: { id: true, name: true } } },
        },
        _count: {
          select: { submissions: true, topicViews: true },
        },
      },
    }),
    prisma.cohort.findMany({
      where: { authorId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <>
      <PageIntro
        eyebrow="Guruh"
        title="O‘quvchilar"
        description="Hisob oching, guruhga biriktiring. Reyting va kontent shu guruhlar bo‘yicha."
        action={
          <Link
            href="/teacher/cohorts"
            className="rounded-[6px] border border-[var(--line)] bg-[var(--btn-secondary-bg)] px-4 py-2.5 text-sm font-medium"
          >
            Guruhlar
          </Link>
        }
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-4 text-lg font-medium">Yangi o‘quvchi</h2>
          <CreateStudentForm cohorts={cohorts} />
        </Panel>

        <div className="space-y-3">
          {students.length ? (
            students.map((student, index) => (
              <Panel key={student.id} index={index} className="!p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-[var(--ink)]">
                      {student.name}
                    </h3>
                    <p className="mt-1 font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                      {student.email}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {student.memberships.length ? (
                        student.memberships.map((m) => (
                          <StatusTag key={m.id} tone="blue">
                            {m.cohort.name}
                          </StatusTag>
                        ))
                      ) : (
                        <StatusTag tone="neutral">Guruhsiz</StatusTag>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      {student._count.submissions} javob ·{" "}
                      {student._count.topicViews} mavzu ·{" "}
                      {formatDate(student.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 border-t border-[var(--line)] pt-4">
                  <ResetPasswordForm studentId={student.id} />
                </div>
              </Panel>
            ))
          ) : (
            <EmptyState
              title="O‘quvchi yo‘q"
              description="Birinchi o‘quvchini chapdagi forma orqali qo‘shing."
            />
          )}
        </div>
      </div>
    </>
  );
}
