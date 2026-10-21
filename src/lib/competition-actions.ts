"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Role } from "@prisma/client";
import { requireUser } from "./auth";
import { prisma } from "./prisma";

type ActionState = {
  error?: string;
  success?: string;
};

export async function createCohortAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const teacher = await requireUser(Role.TEACHER);
  if (!teacher) return { error: "Faqat o‘qituvchi." };

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  if (name.length < 2) return { error: "Guruh nomi juda qisqa." };

  const cohort = await prisma.cohort.create({
    data: {
      name,
      description: description || null,
      authorId: teacher.id,
    },
  });

  revalidatePath("/teacher/cohorts");
  revalidatePath("/teacher/students");
  redirect(`/teacher/cohorts/${cohort.id}`);
}

export async function updateCohortAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const teacher = await requireUser(Role.TEACHER);
  if (!teacher) return { error: "Faqat o‘qituvchi." };

  const cohortId = String(formData.get("cohortId") || "");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  if (!cohortId || name.length < 2) return { error: "Guruh nomini tekshiring." };

  const existing = await prisma.cohort.findUnique({ where: { id: cohortId } });
  if (!existing || existing.authorId !== teacher.id) {
    return { error: "Guruh topilmadi." };
  }

  await prisma.cohort.update({
    where: { id: cohortId },
    data: { name, description: description || null },
  });

  revalidatePath("/teacher/cohorts");
  revalidatePath(`/teacher/cohorts/${cohortId}`);
  return { success: "Guruh yangilandi." };
}

export async function deleteCohortAction(formData: FormData) {
  const teacher = await requireUser(Role.TEACHER);
  if (!teacher) return;

  const cohortId = String(formData.get("cohortId") || "");
  if (!cohortId) return;

  const existing = await prisma.cohort.findUnique({ where: { id: cohortId } });
  if (!existing || existing.authorId !== teacher.id) return;

  await prisma.cohort.delete({ where: { id: cohortId } });

  revalidatePath("/teacher/cohorts");
  revalidatePath("/teacher/students");
  revalidatePath("/student/leaderboard");
  redirect("/teacher/cohorts");
}

export async function addCohortMemberAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const teacher = await requireUser(Role.TEACHER);
  if (!teacher) return { error: "Faqat o‘qituvchi." };

  const cohortId = String(formData.get("cohortId") || "");
  const studentId = String(formData.get("studentId") || "");
  if (!cohortId || !studentId) return { error: "O‘quvchini tanlang." };

  const cohort = await prisma.cohort.findUnique({ where: { id: cohortId } });
  if (!cohort || cohort.authorId !== teacher.id) {
    return { error: "Guruh topilmadi." };
  }

  const student = await prisma.user.findFirst({
    where: { id: studentId, role: Role.STUDENT },
  });
  if (!student) return { error: "O‘quvchi topilmadi." };

  await prisma.cohortMember.upsert({
    where: {
      cohortId_studentId: { cohortId, studentId },
    },
    create: { cohortId, studentId },
    update: {},
  });

  revalidatePath(`/teacher/cohorts/${cohortId}`);
  revalidatePath("/teacher/students");
  revalidatePath("/student/leaderboard");
  return { success: `${student.name} guruhga qo‘shildi.` };
}

export async function removeCohortMemberAction(formData: FormData) {
  const teacher = await requireUser(Role.TEACHER);
  if (!teacher) return;

  const cohortId = String(formData.get("cohortId") || "");
  const studentId = String(formData.get("studentId") || "");
  if (!cohortId || !studentId) return;

  const cohort = await prisma.cohort.findUnique({ where: { id: cohortId } });
  if (!cohort || cohort.authorId !== teacher.id) return;

  await prisma.cohortMember.deleteMany({
    where: { cohortId, studentId },
  });

  revalidatePath(`/teacher/cohorts/${cohortId}`);
  revalidatePath("/teacher/students");
  revalidatePath("/student/leaderboard");
}

const testSchema = z.object({
  assignmentId: z.string().min(1),
  name: z.string().min(2),
  stdin: z.string().optional(),
  expectedStdout: z.string().min(1),
  points: z.coerce.number().int().min(1).max(1000),
  isHidden: z.enum(["true", "false"]).optional(),
});

export async function createAssignmentTestAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const teacher = await requireUser(Role.TEACHER);
  if (!teacher) return { error: "Faqat o‘qituvchi." };

  const parsed = testSchema.safeParse({
    assignmentId: formData.get("assignmentId"),
    name: formData.get("name"),
    stdin: formData.get("stdin") || "",
    expectedStdout: formData.get("expectedStdout"),
    points: formData.get("points") || "1",
    isHidden: formData.get("isHidden") === "false" ? "false" : "true",
  });

  if (!parsed.success) {
    return { error: "Test maydonlarini tekshiring." };
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id: parsed.data.assignmentId },
    include: { _count: { select: { tests: true } } },
  });
  if (!assignment || assignment.authorId !== teacher.id) {
    return { error: "Topshiriq topilmadi." };
  }

  await prisma.assignmentTest.create({
    data: {
      assignmentId: assignment.id,
      name: parsed.data.name,
      stdin: parsed.data.stdin || "",
      expectedStdout: parsed.data.expectedStdout,
      points: parsed.data.points,
      sortOrder: assignment._count.tests,
      isHidden: parsed.data.isHidden !== "false",
    },
  });

  revalidatePath(`/teacher/assignments/${assignment.id}`);
  return { success: "Test qo‘shildi." };
}

export async function deleteAssignmentTestAction(formData: FormData) {
  const teacher = await requireUser(Role.TEACHER);
  if (!teacher) return;

  const testId = String(formData.get("testId") || "");
  if (!testId) return;

  const test = await prisma.assignmentTest.findUnique({
    where: { id: testId },
    include: { assignment: true },
  });
  if (!test || test.assignment.authorId !== teacher.id) return;

  await prisma.assignmentTest.delete({ where: { id: testId } });

  revalidatePath(`/teacher/assignments/${test.assignmentId}`);
}
