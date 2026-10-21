import { prisma } from "./prisma";
import { appPublicUrl, sendTelegramMessage, telegramConfigured } from "./telegram";

type NotifyInput = {
  userId: string;
  title: string;
  body: string;
  href?: string;
};

/** In-app + (yoqilgan bo‘lsa) Telegram. */
export async function notifyUser(input: NotifyInput) {
  await prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      body: input.body,
      href: input.href,
    },
  });

  if (!telegramConfigured()) return;

  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId: input.userId },
  });

  if (!prefs?.telegramEnabled || !prefs.telegramChatId) return;

  const link = input.href ? `${appPublicUrl()}${input.href}` : "";
  const text = [`${input.title}`, input.body, link].filter(Boolean).join("\n");

  try {
    await sendTelegramMessage(prefs.telegramChatId, text);
  } catch {
    // In-app saqlangan — Telegram xatosi asosiy oqimni to‘xtatmasin
  }
}

export async function notifyMany(
  userIds: string[],
  payload: Omit<NotifyInput, "userId">,
) {
  await Promise.all(userIds.map((userId) => notifyUser({ ...payload, userId })));
}
