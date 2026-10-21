import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

/** O‘quvchi ko‘ra oladigan mavzu/topshiriq filtri (guruh + umumiy). */
export async function studentContentWhere(
  studentId: string,
): Promise<Prisma.TopicWhereInput> {
  const memberships = await prisma.cohortMember.findMany({
    where: { studentId },
    select: { cohortId: true },
  });
  const cohortIds = memberships.map((m) => m.cohortId);

  return {
    OR: [{ cohortId: null }, { cohortId: { in: cohortIds } }],
  };
}

export async function studentAssignmentWhere(
  studentId: string,
): Promise<Prisma.AssignmentWhereInput> {
  const memberships = await prisma.cohortMember.findMany({
    where: { studentId },
    select: { cohortId: true },
  });
  const cohortIds = memberships.map((m) => m.cohortId);

  return {
    OR: [{ cohortId: null }, { cohortId: { in: cohortIds } }],
  };
}

export async function studentCanAccessTopic(
  studentId: string,
  topic: { cohortId: string | null },
) {
  if (!topic.cohortId) return true;
  const member = await prisma.cohortMember.findUnique({
    where: {
      cohortId_studentId: { cohortId: topic.cohortId, studentId },
    },
  });
  return Boolean(member);
}

export async function studentCanAccessAssignment(
  studentId: string,
  assignment: { cohortId: string | null },
) {
  if (!assignment.cohortId) return true;
  const member = await prisma.cohortMember.findUnique({
    where: {
      cohortId_studentId: { cohortId: assignment.cohortId, studentId },
    },
  });
  return Boolean(member);
}

export async function cohortStudentIds(cohortId: string | null | undefined) {
  if (!cohortId) {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true },
    });
    return students.map((s) => s.id);
  }

  const members = await prisma.cohortMember.findMany({
    where: { cohortId },
    select: { studentId: true },
  });
  return members.map((m) => m.studentId);
}
