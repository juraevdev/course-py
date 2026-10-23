"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AssignmentStatus, Role, SubmissionKind } from "@prisma/client";
import { gradeCodeAgainstTests } from "./autograde";
import { hashPassword, requireUser } from "./auth";
import {
  cohortStudentIds,
  studentCanAccessAssignment,
  studentCanAccessTopic,
} from "./cohorts";
import { notifyMany, notifyUser } from "./notify";
import { prisma } from "./prisma";
import { saveSubmissionFile } from "./uploads";

export type ActionState = {
  error?: string;
  success?: string;
};

async function resolveCohortId(teacherId: string, raw: FormDataEntryValue | null) {
  const value = String(raw || "").trim();
  if (!value) return null;
  const cohort = await prisma.cohort.findFirst({
    where: { id: value, authorId: teacherId },
  });
  return cohort?.id ?? null;
}

const topicSchema = z.object({
  title: z.string().min(3),
  summary: z.string().min(8),
  content: z.string().min(20),
  resourceUrl: z.string().url().optional().or(z.literal("")),
  cohortId: z.string().optional(),
});

export async function createTopicAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const teacher = await requireUser(Role.TEACHER);
  if (!teacher) return { error: "Faqat o‘qituvchi kirishi mumkin." };

  const parsed = topicSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary"),
    content: formData.get("content"),
    resourceUrl: formData.get("resourceUrl") || "",
    cohortId: formData.get("cohortId") || undefined,
  });

  if (!parsed.success) {
    return { error: "Maydonlarni to‘liq va to‘g‘ri to‘ldiring." };
  }

  const cohortId = await resolveCohortId(teacher.id, parsed.data.cohortId || null);

  const topic = await prisma.topic.create({
    data: {
      title: parsed.data.title,
      summary: parsed.data.summary,
      content: parsed.data.content,
      resourceUrl: parsed.data.resourceUrl || null,
      authorId: teacher.id,
      cohortId,
    },
  });

  const studentIds = await cohortStudentIds(cohortId);
  if (studentIds.length) {
    await notifyMany(studentIds, {
      title: "Yangi mavzu",
      body: `"${topic.title}" mavzusi qo‘shildi.`,
      href: `/student/topics/${topic.id}`,
    });
  }

  revalidatePath("/teacher");
  revalidatePath("/teacher/topics");
  revalidatePath("/student");
  redirect(`/teacher/topics/${topic.id}`);
}

const assignmentSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  topicId: z.string().min(1),
  dueAt: z.string().optional(),
  cohortId: z.string().optional(),
  maxScore: z.coerce.number().int().min(1).max(1000).optional(),
});

export async function createAssignmentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const teacher = await requireUser(Role.TEACHER);
  if (!teacher) return { error: "Faqat o‘qituvchi kirishi mumkin." };

  const parsed = assignmentSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    topicId: formData.get("topicId"),
    dueAt: formData.get("dueAt") || undefined,
    cohortId: formData.get("cohortId") || undefined,
    maxScore: formData.get("maxScore") || "5",
  });

  if (!parsed.success) {
    return { error: "Topshiriq maydonlarini tekshiring." };
  }

  const topic = await prisma.topic.findUnique({
    where: { id: parsed.data.topicId },
  });
  if (!topic || topic.authorId !== teacher.id) {
    return { error: "Mavzu topilmadi yoki sizniki emas." };
  }

  const rawCohort = String(formData.get("cohortId") || "");
  const cohortId = rawCohort
    ? await resolveCohortId(teacher.id, rawCohort)
    : topic.cohortId;

  const assignment = await prisma.assignment.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      topicId: topic.id,
      authorId: teacher.id,
      cohortId,
      maxScore: parsed.data.maxScore ?? 5,
      dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
    },
  });

  const studentIds = await cohortStudentIds(cohortId);
  if (studentIds.length) {
    await notifyMany(studentIds, {
      title: "Yangi topshiriq",
      body: `"${assignment.title}" topshirig‘i berildi.`,
      href: `/student/assignments/${assignment.id}`,
    });
  }

  revalidatePath("/teacher");
  revalidatePath("/teacher/assignments");
  revalidatePath("/student");
  redirect(`/teacher/assignments/${assignment.id}`);
}

export async function updateTopicAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const teacher = await requireUser(Role.TEACHER);
  if (!teacher) return { error: "Faqat o‘qituvchi kirishi mumkin." };

  const topicId = String(formData.get("topicId") || "");
  if (!topicId) return { error: "Mavzu topilmadi." };

  const parsed = topicSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary"),
    content: formData.get("content"),
    resourceUrl: formData.get("resourceUrl") || "",
    cohortId: formData.get("cohortId") || undefined,
  });

  if (!parsed.success) {
    return { error: "Maydonlarni to‘liq va to‘g‘ri to‘ldiring." };
  }

  const existing = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!existing || existing.authorId !== teacher.id) {
    return { error: "Mavzu topilmadi yoki sizniki emas." };
  }

  const cohortId = await resolveCohortId(teacher.id, parsed.data.cohortId || null);

  await prisma.topic.update({
    where: { id: topicId },
    data: {
      title: parsed.data.title,
      summary: parsed.data.summary,
      content: parsed.data.content,
      resourceUrl: parsed.data.resourceUrl || null,
      cohortId,
    },
  });

  revalidatePath("/teacher");
  revalidatePath("/teacher/topics");
  revalidatePath(`/teacher/topics/${topicId}`);
  revalidatePath("/student");
  revalidatePath("/student/topics");
  revalidatePath(`/student/topics/${topicId}`);
  redirect(`/teacher/topics/${topicId}`);
}

export async function deleteTopicAction(formData: FormData) {
  const teacher = await requireUser(Role.TEACHER);
  if (!teacher) return;

  const topicId = String(formData.get("topicId") || "");
  if (!topicId) return;

  const existing = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!existing || existing.authorId !== teacher.id) return;

  await prisma.topic.delete({ where: { id: topicId } });

  revalidatePath("/teacher");
  revalidatePath("/teacher/topics");
  revalidatePath("/teacher/assignments");
  revalidatePath("/student");
  revalidatePath("/student/topics");
  revalidatePath("/student/assignments");
  redirect("/teacher/topics");
}

export async function updateAssignmentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const teacher = await requireUser(Role.TEACHER);
  if (!teacher) return { error: "Faqat o‘qituvchi kirishi mumkin." };

  const assignmentId = String(formData.get("assignmentId") || "");
  if (!assignmentId) return { error: "Topshiriq topilmadi." };

  const parsed = assignmentSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    topicId: formData.get("topicId"),
    dueAt: formData.get("dueAt") || undefined,
    cohortId: formData.get("cohortId") || undefined,
    maxScore: formData.get("maxScore") || "5",
  });

  if (!parsed.success) {
    return { error: "Topshiriq maydonlarini tekshiring." };
  }

  const existing = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });
  if (!existing || existing.authorId !== teacher.id) {
    return { error: "Topshiriq topilmadi yoki sizniki emas." };
  }

  const topic = await prisma.topic.findUnique({
    where: { id: parsed.data.topicId },
  });
  if (!topic || topic.authorId !== teacher.id) {
    return { error: "Mavzu topilmadi yoki sizniki emas." };
  }

  const rawCohort = String(formData.get("cohortId") || "");
  const cohortId = rawCohort
    ? await resolveCohortId(teacher.id, rawCohort)
    : topic.cohortId;

  await prisma.assignment.update({
    where: { id: assignmentId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      topicId: topic.id,
      cohortId,
      maxScore: parsed.data.maxScore ?? existing.maxScore,
      dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
    },
  });

  revalidatePath("/teacher");
  revalidatePath("/teacher/assignments");
  revalidatePath(`/teacher/assignments/${assignmentId}`);
  revalidatePath(`/teacher/topics/${topic.id}`);
  revalidatePath("/student");
  revalidatePath("/student/assignments");
  revalidatePath(`/student/assignments/${assignmentId}`);
  redirect(`/teacher/assignments/${assignmentId}`);
}

export async function deleteAssignmentAction(formData: FormData) {
  const teacher = await requireUser(Role.TEACHER);
  if (!teacher) return;

  const assignmentId = String(formData.get("assignmentId") || "");
  if (!assignmentId) return;

  const existing = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });
  if (!existing || existing.authorId !== teacher.id) return;

  await prisma.assignment.delete({ where: { id: assignmentId } });

  revalidatePath("/teacher");
  revalidatePath("/teacher/assignments");
  revalidatePath(`/teacher/topics/${existing.topicId}`);
  revalidatePath("/student");
  revalidatePath("/student/assignments");
  redirect("/teacher/assignments");
}

const submissionSchema = z.object({
  assignmentId: z.string().min(1),
  content: z.string().min(1),
  kind: z.enum(["TEXT", "CODE"]).default("TEXT"),
});

export async function submitAssignmentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const student = await requireUser(Role.STUDENT);
  if (!student) return { error: "Faqat o‘quvchi topshirishi mumkin." };

  const kindRaw = String(formData.get("kind") || "TEXT").toUpperCase();
  const parsed = submissionSchema.safeParse({
    assignmentId: formData.get("assignmentId"),
    content: formData.get("content"),
    kind: kindRaw === "CODE" ? "CODE" : "TEXT",
  });

  if (!parsed.success) {
    return { error: "Javobni to‘ldiring." };
  }

  const minLen = parsed.data.kind === "CODE" ? 3 : 10;
  if (parsed.data.content.trim().length < minLen) {
    return {
      error:
        parsed.data.kind === "CODE"
          ? "Kod juda qisqa."
          : "Javob kamida 10 belgidan iborat bo‘lsin.",
    };
  }

  let fileName: string | null = null;
  let filePath: string | null = null;
  const file = formData.get("file");

  if (file instanceof File && file.size > 0) {
    try {
      const saved = await saveSubmissionFile(
        student.id,
        parsed.data.assignmentId,
        file,
      );
      fileName = saved.fileName;
      filePath = saved.filePath;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Fayl yuklanmadi.",
      };
    }
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id: parsed.data.assignmentId },
  });
  if (!assignment) return { error: "Topshiriq topilmadi." };

  const allowed = await studentCanAccessAssignment(student.id, assignment);
  if (!allowed) return { error: "Bu topshiriq guruhingizga tegishli emas." };

  const kind =
    parsed.data.kind === "CODE" ? SubmissionKind.CODE : SubmissionKind.TEXT;

  let autoScore: number | null = null;
  let testsPassed: number | null = null;
  let testsTotal: number | null = null;
  let testReport: string | null = null;
  let score: number | null = null;
  let successMsg = "Javobingiz saqlandi.";

  if (kind === SubmissionKind.CODE) {
    const graded = await gradeCodeAgainstTests(
      assignment.id,
      parsed.data.content,
    );
    if (graded) {
      autoScore = graded.autoScore;
      testsPassed = graded.testsPassed;
      testsTotal = graded.testsTotal;
      testReport = graded.reportJson;
      score = graded.autoScore;
      successMsg = `Javob saqlandi. Avto-test: ${graded.testsPassed}/${graded.testsTotal} · ${graded.autoScore}/${assignment.maxScore} ball.`;
    }
  }

  await prisma.submission.upsert({
    where: {
      assignmentId_studentId: {
        assignmentId: parsed.data.assignmentId,
        studentId: student.id,
      },
    },
    create: {
      assignmentId: parsed.data.assignmentId,
      studentId: student.id,
      content: parsed.data.content,
      kind,
      status: AssignmentStatus.SUBMITTED,
      fileName,
      filePath,
      autoScore,
      testsPassed,
      testsTotal,
      testReport,
      score,
    },
    update: {
      content: parsed.data.content,
      kind,
      status: AssignmentStatus.SUBMITTED,
      feedback: null,
      autoScore,
      testsPassed,
      testsTotal,
      testReport,
      score,
      ...(fileName ? { fileName, filePath } : {}),
    },
  });

  await notifyUser({
    userId: assignment.authorId,
    title: "Yangi javob",
    body: `${student.name} — "${assignment.title}" topshirig‘ini yubordi.`,
    href: `/teacher/assignments/${assignment.id}`,
  });

  revalidatePath("/student");
  revalidatePath("/student/leaderboard");
  revalidatePath("/teacher/leaderboard");
  revalidatePath(`/student/assignments/${parsed.data.assignmentId}`);
  revalidatePath(`/teacher/assignments/${assignment.id}`);
  return { success: successMsg };
}

export async function markNotificationReadAction(notificationId: string) {
  const user = await requireUser();
  if (!user) return;

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { read: true },
  });

  revalidatePath(user.role === Role.TEACHER ? "/teacher" : "/student");
}

export async function markNotificationReadFormAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (id) await markNotificationReadAction(id);
}

export async function markAllNotificationsReadAction() {
  const user = await requireUser();
  if (!user) return;

  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });

  revalidatePath(user.role === Role.TEACHER ? "/teacher" : "/student");
}

const feedbackSchema = z.object({
  submissionId: z.string().min(1),
  feedback: z.string().min(3),
  score: z.coerce.number().int(),
});

export async function reviewSubmissionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const teacher = await requireUser(Role.TEACHER);
  if (!teacher) return { error: "Faqat o‘qituvchi ko‘rib chiqishi mumkin." };

  const parsed = feedbackSchema.safeParse({
    submissionId: formData.get("submissionId"),
    feedback: formData.get("feedback"),
    score: formData.get("score"),
  });

  if (!parsed.success) {
    return { error: "Izoh va ballni kiriting." };
  }

  const existing = await prisma.submission.findUnique({
    where: { id: parsed.data.submissionId },
    include: { assignment: true },
  });
  if (!existing || existing.assignment.authorId !== teacher.id) {
    return { error: "Bu topshiriq sizniki emas." };
  }

  const max = existing.assignment.maxScore;
  const min = -max;
  if (parsed.data.score > max || parsed.data.score < min) {
    return {
      error: `Ball ${min} dan ${max} gacha bo‘lishi kerak.`,
    };
  }

  const submission = await prisma.submission.update({
    where: { id: parsed.data.submissionId },
    data: {
      feedback: parsed.data.feedback,
      score: parsed.data.score,
      status: AssignmentStatus.REVIEWED,
    },
    include: { assignment: true, student: true },
  });

  await notifyUser({
    userId: submission.studentId,
    title: "Topshiriq baholandi",
    body: `"${submission.assignment.title}" — ${parsed.data.score}/${submission.assignment.maxScore} ball.`,
    href: `/student/assignments/${submission.assignmentId}`,
  });

  revalidatePath(`/teacher/assignments/${submission.assignmentId}`);
  revalidatePath(`/teacher/submissions`);
  revalidatePath(`/teacher/submissions/${submission.id}`);
  revalidatePath("/teacher");
  revalidatePath(`/student/assignments/${submission.assignmentId}`);
  revalidatePath("/student/leaderboard");
  revalidatePath("/teacher/leaderboard");
  return { success: "Ball va izoh saqlandi. Keyingisiga o‘ting." };
}

export async function markTopicViewedAction(topicId: string) {
  const student = await requireUser(Role.STUDENT);
  if (!student) return;

  const existing = await prisma.topicView.findUnique({
    where: { userId_topicId: { userId: student.id, topicId } },
  });

  if (existing) return;

  await prisma.topicView.create({
    data: { userId: student.id, topicId },
  });

  // Faqat ro‘yxat — joriy sahifani qayta yuklamaymiz (loop bo‘lmasin)
  revalidatePath("/student");
  revalidatePath("/student/topics");
}

export async function askTopicQuestionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const student = await requireUser(Role.STUDENT);
  if (!student) return { error: "Faqat o‘quvchi so‘rash mumkin." };

  const topicId = String(formData.get("topicId") || "");
  const body = String(formData.get("body") || "").trim();
  if (!topicId || body.length < 5) {
    return { error: "Savol kamida 5 belgidan iborat bo‘lsin." };
  }

  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) return { error: "Mavzu topilmadi." };

  const allowed = await studentCanAccessTopic(student.id, topic);
  if (!allowed) return { error: "Bu mavzu guruhingizga tegishli emas." };

  await prisma.topicQuestion.create({
    data: { topicId, studentId: student.id, body },
  });

  await notifyUser({
    userId: topic.authorId,
    title: "Yangi savol",
    body: `${student.name}: ${body.slice(0, 80)}`,
    href: `/teacher/topics/${topicId}`,
  });

  revalidatePath(`/student/topics/${topicId}`);
  revalidatePath(`/teacher/topics/${topicId}`);
  return { success: "Savolingiz yuborildi." };
}

export async function answerTopicQuestionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const teacher = await requireUser(Role.TEACHER);
  if (!teacher) return { error: "Faqat o‘qituvchi javob beradi." };

  const questionId = String(formData.get("questionId") || "");
  const answer = String(formData.get("answer") || "").trim();
  if (!questionId || answer.length < 2) {
    return { error: "Javobni kiriting." };
  }

  const existing = await prisma.topicQuestion.findUnique({
    where: { id: questionId },
    include: { topic: true },
  });
  if (!existing || existing.topic.authorId !== teacher.id) {
    return { error: "Bu savol sizning mavzuingizga tegishli emas." };
  }

  const question = await prisma.topicQuestion.update({
    where: { id: questionId },
    data: {
      answer,
      answeredBy: teacher.id,
      answeredAt: new Date(),
    },
  });

  await notifyUser({
    userId: question.studentId,
    title: "Savolingizga javob",
    body: answer.slice(0, 120),
    href: `/student/topics/${question.topicId}`,
  });

  revalidatePath(`/teacher/topics/${question.topicId}`);
  revalidatePath(`/student/topics/${question.topicId}`);
  return { success: "Javob saqlandi." };
}

export async function saveNoteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const student = await requireUser(Role.STUDENT);
  if (!student) return { error: "Faqat o‘quvchi." };

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const topicId = String(formData.get("topicId") || "") || null;
  const noteId = String(formData.get("noteId") || "") || null;

  if (title.length < 2 || body.length < 2) {
    return { error: "Sarlavha va matn kerak." };
  }

  if (noteId) {
    await prisma.studentNote.updateMany({
      where: { id: noteId, studentId: student.id },
      data: { title, body, topicId },
    });
  } else {
    await prisma.studentNote.create({
      data: {
        title,
        body,
        topicId,
        studentId: student.id,
      },
    });
  }

  revalidatePath("/student/notes");
  if (topicId) revalidatePath(`/student/topics/${topicId}`);
  return { success: "Eslatma saqlandi." };
}

export async function deleteNoteAction(formData: FormData) {
  const student = await requireUser(Role.STUDENT);
  if (!student) return;

  const noteId = String(formData.get("noteId") || "");
  if (!noteId) return;

  await prisma.studentNote.deleteMany({
    where: { id: noteId, studentId: student.id },
  });

  revalidatePath("/student/notes");
}

export async function createStudentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const teacher = await requireUser(Role.TEACHER);
  if (!teacher) return { error: "Faqat o‘qituvchi." };

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const cohortIdRaw = String(formData.get("cohortId") || "").trim();

  if (name.length < 2) return { error: "Ism juda qisqa." };
  if (!email.includes("@")) return { error: "Email noto‘g‘ri." };
  if (password.length < 8) return { error: "Parol kamida 8 belgi." };

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "Bu email allaqachon ro‘yxatda." };

  const cohortId = await resolveCohortId(teacher.id, cohortIdRaw || null);

  const student = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: Role.STUDENT,
    },
  });

  if (cohortId) {
    await prisma.cohortMember.create({
      data: { cohortId, studentId: student.id },
    });
  }

  revalidatePath("/teacher/students");
  revalidatePath("/teacher/cohorts");
  revalidatePath("/teacher");
  return {
    success: cohortId
      ? `${name} qo‘shildi va guruhga biriktirildi.`
      : `${name} qo‘shildi.`,
  };
}

export async function resetStudentPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const teacher = await requireUser(Role.TEACHER);
  if (!teacher) return { error: "Faqat o‘qituvchi." };

  const studentId = String(formData.get("studentId") || "");
  const password = String(formData.get("password") || "");
  if (!studentId || password.length < 8) {
    return { error: "Yangi parol kamida 8 belgi." };
  }

  const student = await prisma.user.findFirst({
    where: { id: studentId, role: Role.STUDENT },
  });
  if (!student) return { error: "O‘quvchi topilmadi." };

  await prisma.user.update({
    where: { id: student.id },
    data: { passwordHash: await hashPassword(password) },
  });

  revalidatePath("/teacher/students");
  return { success: `${student.name} uchun parol yangilandi.` };
}
