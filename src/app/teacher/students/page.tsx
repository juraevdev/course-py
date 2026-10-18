import { CreateStudentForm, ResetPasswordForm } from "@/components/teacher-forms";
import { EmptyState, PageIntro, Panel } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function TeacherStudentsPage() {
  const students = await prisma.user.findMany({
    where: { role: Role.STUDENT },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { submissions: true, topicViews: true },
      },
    },
  });

  return (
    <>
      <PageIntro
        eyebrow="Guruh"
        title="O‘quvchilar"
        description="Yangi hisob oching va vaqtinchalik parol bering. Ular login orqali kiradi."
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-4 text-lg font-medium">Yangi o‘quvchi</h2>
          <CreateStudentForm />
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
