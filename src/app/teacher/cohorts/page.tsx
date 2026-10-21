import Link from "next/link";
import { CreateCohortForm } from "@/components/competition-forms";
import { EmptyState, PageIntro, Panel, StatusTag } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function TeacherCohortsPage() {
  const user = await requireUser(Role.TEACHER);
  if (!user) return null;

  const cohorts = await prisma.cohort.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { members: true, assignments: true, topics: true } },
    },
  });

  return (
    <>
      <PageIntro
        eyebrow="Bellashuv"
        title="Guruhlar"
        description="O‘quvchilarni guruhlarga bo‘ling — kontent va reyting shu bo‘yicha ajraladi."
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-4 text-lg font-medium">Yangi guruh</h2>
          <CreateCohortForm />
        </Panel>

        <div className="space-y-3">
          {cohorts.length ? (
            cohorts.map((cohort, index) => (
              <Link key={cohort.id} href={`/teacher/cohorts/${cohort.id}`}>
                <Panel index={index} className="mb-3 !p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-medium text-[var(--ink)]">{cohort.name}</h3>
                    <StatusTag tone="blue">{cohort._count.members} a’zo</StatusTag>
                  </div>
                  {cohort.description ? (
                    <p className="mt-1 text-sm text-[var(--muted)] line-clamp-2">
                      {cohort.description}
                    </p>
                  ) : null}
                  <p className="mt-3 font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                    {cohort._count.topics} mavzu · {cohort._count.assignments}{" "}
                    topshiriq · {formatDate(cohort.createdAt)}
                  </p>
                </Panel>
              </Link>
            ))
          ) : (
            <EmptyState
              title="Guruh yo‘q"
              description="Birinchi guruhni yarating, so‘ng o‘quvchilarni qo‘shing."
            />
          )}
        </div>
      </div>
    </>
  );
}
