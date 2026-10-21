"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { requireUser } from "./auth";
import {
  buildTelegramDeepLink,
  telegramBotUsername,
  telegramConfigured,
} from "./telegram";
import { prisma } from "./prisma";

export type ActionState = {
  error?: string;
  success?: string;
  deepLink?: string;
};

function settingsPath(role: Role) {
  return role === Role.TEACHER ? "/teacher/settings" : "/student/settings";
}

export async function createTelegramLinkAction(): Promise<ActionState> {
  const user = await requireUser();
  if (!user) return { error: "Avval tizimga kiring." };

  if (!telegramConfigured()) {
    return { error: "Telegram bot serverda sozlanmagan." };
  }
  if (!telegramBotUsername()) {
    return {
      error: "TELEGRAM_BOT_USERNAME .env da ko‘rsatilmagan.",
    };
  }

  const token = randomBytes(16).toString("hex");
  const expires = new Date(Date.now() + 30 * 60 * 1000);

  await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      telegramLinkToken: token,
      telegramLinkExpiresAt: expires,
    },
    update: {
      telegramLinkToken: token,
      telegramLinkExpiresAt: expires,
    },
  });

  const deepLink = buildTelegramDeepLink(token);
  revalidatePath(settingsPath(user.role));

  return {
    success: "Havolani oching va botda Start bosing (30 daqiqa amal qiladi).",
    deepLink: deepLink || undefined,
  };
}

export async function unlinkTelegramAction(): Promise<ActionState> {
  const user = await requireUser();
  if (!user) return { error: "Avval tizimga kiring." };

  await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      telegramEnabled: false,
      telegramChatId: null,
      telegramLinkToken: null,
      telegramLinkExpiresAt: null,
    },
    update: {
      telegramEnabled: false,
      telegramChatId: null,
      telegramLinkToken: null,
      telegramLinkExpiresAt: null,
    },
  });

  revalidatePath(settingsPath(user.role));
  return { success: "Telegram uzildi." };
}

export async function setTelegramEnabledAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  if (!user) return { error: "Avval tizimga kiring." };

  const enabled = formData.get("enabled") === "1";

  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId: user.id },
  });

  if (enabled && !prefs?.telegramChatId) {
    return { error: "Avval Telegramni bog‘lang." };
  }

  await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      telegramEnabled: enabled,
    },
    update: {
      telegramEnabled: enabled,
    },
  });

  revalidatePath(settingsPath(user.role));
  return {
    success: enabled
      ? "Telegram bildirishnomalar yoqildi."
      : "Telegram bildirishnomalar o‘chirildi.",
  };
}
