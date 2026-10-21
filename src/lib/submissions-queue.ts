import { AssignmentStatus } from "@prisma/client";
import { prisma } from "./prisma";

const submissionInclude = {
  student: { select: { id: true, name: true, email: true } },
  assignment: {
    select: {
      id: true,
      title: true,
      maxScore: true,
      authorId: true,
      topic: { select: { id: true, title: true } },
      cohort: { select: { id: true, name: true } },
    },
  },
} as const;

export async function listTeacherSubmissions(
  teacherId: string,
  options?: { status?: "pending" | "reviewed" | "all" },
) {
  const status = options?.status ?? "all";
  const statusWhere =
    status === "pending"
      ? { status: { not: AssignmentStatus.REVIEWED } }
      : status === "reviewed"
        ? { status: AssignmentStatus.REVIEWED }
        : {};

  const rows = await prisma.submission.findMany({
    where: {
      assignment: { authorId: teacherId },
      ...statusWhere,
    },
    include: submissionInclude,
    orderBy: { createdAt: "asc" },
  });

  // Baholanmaganlar yuqorida
  return rows.sort((a, b) => {
    const ap = a.status === AssignmentStatus.REVIEWED ? 1 : 0;
    const bp = b.status === AssignmentStatus.REVIEWED ? 1 : 0;
    if (ap !== bp) return ap - bp;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
}

/** Navbatdagi keyingi baholanmagan javob (joriy dan keyin, yo‘q bo‘lsa boshidan). */
export async function findNextPendingSubmission(
  teacherId: string,
  currentId?: string,
) {
  const pending = await prisma.submission.findMany({
    where: {
      assignment: { authorId: teacherId },
      status: { not: AssignmentStatus.REVIEWED },
      ...(currentId ? { NOT: { id: currentId } } : {}),
    },
    select: { id: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  if (!pending.length) return null;

  if (!currentId) return pending[0];

  const current = await prisma.submission.findUnique({
    where: { id: currentId },
    select: { createdAt: true },
  });
  if (!current) return pending[0];

  const after = pending.find((p) => p.createdAt >= current.createdAt);
  return after ?? pending[0];
}

export async function countPendingSubmissions(teacherId: string) {
  return prisma.submission.count({
    where: {
      assignment: { authorId: teacherId },
      status: { not: AssignmentStatus.REVIEWED },
    },
  });
}
