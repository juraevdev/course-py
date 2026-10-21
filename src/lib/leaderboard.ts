import { prisma } from "./prisma";

export type LeaderboardRow = {
  rank: number;
  studentId: string;
  name: string;
  totalScore: number;
  gradedCount: number;
  submittedCount: number;
};

export async function getLeaderboard(options?: {
  cohortId?: string | null;
  authorId?: string;
}): Promise<LeaderboardRow[]> {
  const cohortId = options?.cohortId;

  let studentIds: string[];
  if (cohortId) {
    const members = await prisma.cohortMember.findMany({
      where: { cohortId },
      include: { student: { select: { id: true, name: true } } },
    });
    studentIds = members.map((m) => m.studentId);
  } else {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true },
    });
    studentIds = students.map((s) => s.id);
  }

  if (!studentIds.length) return [];

  const assignmentWhere = {
    ...(options?.authorId ? { authorId: options.authorId } : {}),
    ...(cohortId
      ? { OR: [{ cohortId }, { cohortId: null }] }
      : {}),
  };

  const assignments = await prisma.assignment.findMany({
    where: assignmentWhere,
    select: { id: true },
  });
  const assignmentIds = assignments.map((a) => a.id);

  const students = await prisma.user.findMany({
    where: { id: { in: studentIds } },
    select: { id: true, name: true },
  });

  const submissions = assignmentIds.length
    ? await prisma.submission.findMany({
        where: {
          studentId: { in: studentIds },
          assignmentId: { in: assignmentIds },
        },
        select: {
          studentId: true,
          score: true,
        },
      })
    : [];

  const byStudent = new Map<
    string,
    { totalScore: number; gradedCount: number; submittedCount: number }
  >();

  for (const student of students) {
    byStudent.set(student.id, {
      totalScore: 0,
      gradedCount: 0,
      submittedCount: 0,
    });
  }

  for (const sub of submissions) {
    const row = byStudent.get(sub.studentId);
    if (!row) continue;
    row.submittedCount += 1;
    if (sub.score != null) {
      row.totalScore += sub.score;
      row.gradedCount += 1;
    }
  }

  const ranked = students
    .map((student) => {
      const stats = byStudent.get(student.id)!;
      return {
        studentId: student.id,
        name: student.name,
        ...stats,
      };
    })
    .sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.gradedCount !== a.gradedCount) return b.gradedCount - a.gradedCount;
      return a.name.localeCompare(b.name, "uz");
    });

  return ranked.map((row, index) => ({
    rank: index + 1,
    ...row,
  }));
}
