"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Role } from "@prisma/client";
import {
  createSession,
  destroySession,
  verifyPassword,
} from "./auth";
import { prisma } from "./prisma";
import { rateLimit } from "./rate-limit";

export type ActionState = {
  error?: string;
  success?: string;
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    "unknown";
  const emailRaw = String(formData.get("email") || "").toLowerCase();
  const limited = await rateLimit(`login:${ip}:${emailRaw}`, 8, 15 * 60_000);
  if (!limited.ok) {
    return {
      error: `Juda ko‘p urinish. ${limited.retryAfterSec} soniyadan keyin qayta urinib ko‘ring.`,
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Email yoki parol noto‘g‘ri formatda." };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "Email yoki parol xato." };
  }

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  redirect(user.role === Role.TEACHER ? "/teacher" : "/student");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
