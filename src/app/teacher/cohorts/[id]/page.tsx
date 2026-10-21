import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AddCohortMemberForm,
  DeleteCohortForm,
  RemoveCohortMemberForm,
  UpdateCohortForm,
} from "@/components/competition-forms";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { PageIntro, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getLeaderboard } from "@/lib/leaderboard";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function TeacherCohortDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser(Role.TEACHER);
  if (!user) return null;

  const { id } = await params;
  const cohort = await prisma.cohort.findUnique({
    where: { id },
    include: {
      members: {
        include: { student: true },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  if (!cohort || cohort.authorId !== user.id) notFound();

  const memberIds = new Set(cohort.members.map((m) => m.studentId));
  const availableStudents = await prisma.user.findMany({
    where: { role: Role.STUDENT, NOT: { id: { in: [...memberIds] } } },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const board = await getLeaderboard({
    cohortId: cohort.id,
    authorId: user.id,
  });

  return (
    <>
      <PageIntro
        eyebrow="Guruh"
        title={cohort.name}
        description={cohort.description || "Guruh a’zolari va ichki reyting."}
        action={
          <Link
            href={`/teacher/leaderboard?cohortId=${cohort.id}`}
            className="rounded-[6px] border border-[var(--line)] bg-[var(--btn-secondary-bg)] px-4 py-2.5 text-sm font-medium"
          >
            To‘liq reyting
          </Link>
        }
      />

      <div className="mb-10 grid gap-8 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-4 text-lg font-medium">Tahrirlash</h2>
          <UpdateCohortForm
            cohortId={cohort.id}
            name={cohort.name}
            description={cohort.description}
          />
          <div className="mt-6 border-t border-[var(--line)] pt-4">
            <DeleteCohortForm cohortId={cohort.id} />
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-4 text-lg font-medium">A’zo qo‘shish</h2>
          <AddCohortMemberForm
            cohortId={cohort.id}
            students={availableStudents}
          />
          <div className="mt-6 space-y-3 border-t border-[var(--line)] pt-4">
            {cohort.members.length ? (
              cohort.members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-medium text-[var(--ink)]">
                      {m.student.name}
                    </p>
                    <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                      {m.student.email}
                    </p>
                  </div>
                  <RemoveCohortMemberForm
                    cohortId={cohort.id}
                    studentId={m.studentId}
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">Hali a’zo yo‘q.</p>
            )}
          </div>
        </Panel>
      </div>

      <h2 className="mb-4 text-lg font-medium">Guruh reytingi</h2>
      <LeaderboardTable rows={board} />
    </>
  );
}
