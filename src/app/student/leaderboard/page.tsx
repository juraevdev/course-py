import Link from "next/link";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { PageIntro, Panel, StatusTag } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getLeaderboard } from "@/lib/leaderboard";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function StudentLeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ cohortId?: string }>;
}) {
  const user = await requireUser(Role.STUDENT);
  if (!user) return null;

  const { cohortId } = await searchParams;
  const memberships = await prisma.cohortMember.findMany({
    where: { studentId: user.id },
    include: { cohort: { select: { id: true, name: true } } },
    orderBy: { joinedAt: "asc" },
  });

  const cohorts = memberships.map((m) => m.cohort);
  const wantGlobal = cohortId === "all" || (!cohortId && cohorts.length === 0);
  const activeId = wantGlobal
    ? null
    : cohortId && cohorts.some((c) => c.id === cohortId)
      ? cohortId
      : (cohorts[0]?.id ?? null);

  const rows = await getLeaderboard({ cohortId: activeId });
  const mine = rows.find((r) => r.studentId === user.id);

  return (
    <>
      <PageIntro
        eyebrow="Bellashuv"
        title="Reyting"
        description="Guruhdoshlaringiz bilan ball to‘plab, o‘rin uchun bellashing."
      />

      {mine ? (
        <Panel className="mb-8 !py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.06em] text-[var(--muted)]">
                Sizning o‘rningiz
              </p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-3xl tracking-[-0.03em]">
                #{mine.rank}
              </p>
            </div>
            <div className="text-right">
              <p className="font-[family-name:var(--font-display)] text-3xl tracking-[-0.03em]">
                {mine.totalScore}
              </p>
              <p className="text-xs text-[var(--muted)]">jami ball</p>
            </div>
          </div>
        </Panel>
      ) : null}

      {cohorts.length ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {cohorts.map((c) => (
            <Link key={c.id} href={`/student/leaderboard?cohortId=${c.id}`}>
              <StatusTag tone={activeId === c.id ? "blue" : "neutral"}>
                {c.name}
              </StatusTag>
            </Link>
          ))}
          <Link href="/student/leaderboard?cohortId=all">
            <StatusTag tone={wantGlobal ? "blue" : "neutral"}>Umumiy</StatusTag>
          </Link>
        </div>
      ) : (
        <Panel className="mb-6 !py-5">
          <p className="text-sm text-[var(--muted)]">
            Siz hali guruhga biriktirilmagansiz — umumiy reyting ko‘rsatiladi.
          </p>
        </Panel>
      )}

      <LeaderboardTable rows={rows} currentUserId={user.id} />
    </>
  );
}
