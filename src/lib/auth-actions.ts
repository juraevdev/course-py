"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { Role } from "@prisma/client";
import {
  createSession,
  destroySession,
  verifyPassword,
} from "./auth";
import { prisma } from "./prisma";

export type ActionState = {
  error?: string;
  success?: string;
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
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
