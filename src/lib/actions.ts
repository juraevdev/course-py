"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AssignmentStatus, Role, SubmissionKind } from "@prisma/client";
import { hashPassword, requireUser } from "./auth";
import { notifyMany, notifyUser } from "./notify";
import { prisma } from "./prisma";
import { saveSubmissionFile } from "./uploads";

export type ActionState = {
  error?: string;
  success?: string;
};

const topicSchema = z.object({
  title: z.string().min(3),
  summary: z.string().min(8),
  content: z.string().min(20),
  resourceUrl: z.string().url().optional().or(z.literal("")),
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
  });

  if (!parsed.success) {
    return { error: "Maydonlarni to‘liq va to‘g‘ri to‘ldiring." };
  }

  const topic = await prisma.topic.create({
    data: {
      title: parsed.data.title,
      summary: parsed.data.summary,
      content: parsed.data.content,
      resourceUrl: parsed.data.resourceUrl || null,
      authorId: teacher.id,
    },
  });

  const students = await prisma.user.findMany({
    where: { role: Role.STUDENT },
    select: { id: true },
  });

  if (students.length) {
    await notifyMany(
      students.map((s) => s.id),
      {
        title: "Yangi mavzu",
        body: `"${topic.title}" mavzusi qo‘shildi.`,
        href: `/student/topics/${topic.id}`,
      },
    );
  }

  revalidatePath("/teacher");
  revalidatePath("/student");
  redirect(`/teacher/topics/${topic.id}`);
}

const assignmentSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  topicId: z.string().min(1),
  dueAt: z.string().optional(),
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

  const assignment = await prisma.assignment.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      topicId: topic.id,
      authorId: teacher.id,
      dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
    },
  });

  const students = await prisma.user.findMany({
    where: { role: Role.STUDENT },
    select: { id: true },
  });

  if (students.length) {
    await notifyMany(
      students.map((s) => s.id),
      {
        title: "Yangi topshiriq",
        body: `"${assignment.title}" topshirig‘i berildi.`,
        href: `/student/assignments/${assignment.id}`,
      },
    );
  }

  revalidatePath("/teacher");
  revalidatePath("/student");
  redirect(`/teacher/assignments/${assignment.id}`);
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

  const kind =
    parsed.data.kind === "CODE" ? SubmissionKind.CODE : SubmissionKind.TEXT;

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
    },
    update: {
      content: parsed.data.content,
      kind,
      status: AssignmentStatus.SUBMITTED,
      ...(fileName ? { fileName, filePath } : {}),
    },
  });

  const teachers = await prisma.user.findMany({
    where: { role: Role.TEACHER },
    select: { id: true },
  });

  const assignment = await prisma.assignment.findUnique({
    where: { id: parsed.data.assignmentId },
  });

  if (assignment && teachers.length) {
    await notifyMany(
      teachers.map((t) => t.id),
      {
        title: "Yangi javob",
        body: `${student.name} — "${assignment.title}" topshirig‘ini yubordi.`,
        href: `/teacher/assignments/${assignment.id}`,
      },
    );
  }

  revalidatePath("/student");
  revalidatePath(`/student/assignments/${parsed.data.assignmentId}`);
  return { success: "Javobingiz saqlandi." };
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
  });

  if (!parsed.success) {
    return { error: "Izohni kiriting." };
  }

  const existing = await prisma.submission.findUnique({
    where: { id: parsed.data.submissionId },
    include: { assignment: true },
  });
  if (!existing || existing.assignment.authorId !== teacher.id) {
    return { error: "Bu topshiriq sizniki emas." };
  }

  const submission = await prisma.submission.update({
    where: { id: parsed.data.submissionId },
    data: {
      feedback: parsed.data.feedback,
      status: AssignmentStatus.REVIEWED,
    },
    include: { assignment: true, student: true },
  });

  await notifyUser({
    userId: submission.studentId,
    title: "Topshiriq ko‘rib chiqildi",
    body: `"${submission.assignment.title}" uchun izoh keldi.`,
    href: `/student/assignments/${submission.assignmentId}`,
  });

  revalidatePath(`/teacher/assignments/${submission.assignmentId}`);
  return { success: "Izoh saqlandi." };
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

  if (name.length < 2) return { error: "Ism juda qisqa." };
  if (!email.includes("@")) return { error: "Email noto‘g‘ri." };
  if (password.length < 8) return { error: "Parol kamida 8 belgi." };

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "Bu email allaqachon ro‘yxatda." };

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: Role.STUDENT,
    },
  });

  revalidatePath("/teacher/students");
  revalidatePath("/teacher");
  return { success: `${name} qo‘shildi.` };
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
