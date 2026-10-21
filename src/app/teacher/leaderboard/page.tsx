import Link from "next/link";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { PageIntro, StatusTag } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getLeaderboard } from "@/lib/leaderboard";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function TeacherLeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ cohortId?: string }>;
}) {
  const user = await requireUser(Role.TEACHER);
  if (!user) return null;

  const { cohortId } = await searchParams;
  const cohorts = await prisma.cohort.findMany({
    where: { authorId: user.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const activeId =
    cohortId && cohorts.some((c) => c.id === cohortId) ? cohortId : null;

  const rows = await getLeaderboard({
    cohortId: activeId,
    authorId: user.id,
  });

  return (
    <>
      <PageIntro
        eyebrow="Bellashuv"
        title="Reyting"
        description="O‘quvchilar to‘plagan ballar bo‘yicha tartib. Guruh bo‘yicha filtrlang."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/teacher/leaderboard">
          <StatusTag tone={activeId ? "neutral" : "blue"}>Umumiy</StatusTag>
        </Link>
        {cohorts.map((c) => (
          <Link key={c.id} href={`/teacher/leaderboard?cohortId=${c.id}`}>
            <StatusTag tone={activeId === c.id ? "blue" : "neutral"}>
              {c.name}
            </StatusTag>
          </Link>
        ))}
      </div>

      <LeaderboardTable rows={rows} />
    </>
  );
}
