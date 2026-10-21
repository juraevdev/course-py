import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendTelegramMessage,
  verifyTelegramWebhookSecret,
} from "@/lib/telegram";

type TelegramUpdate = {
  message?: {
    chat?: { id?: number | string };
    text?: string;
    from?: { first_name?: string };
  };
};

export async function POST(request: Request) {
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (!verifyTelegramWebhookSecret(secret)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const chatId = update.message?.chat?.id;
  const text = (update.message?.text || "").trim();

  if (chatId == null || !text) {
    return NextResponse.json({ ok: true });
  }

  const chatIdStr = String(chatId);

  if (text === "/start" || text.startsWith("/start ")) {
    const payload = text === "/start" ? "" : text.slice("/start ".length).trim();

    if (!payload) {
      await sendTelegramMessage(
        chatIdStr,
        "Kurs botiga xush kelibsiz.\n\nHisobni bog‘lash uchun saytdagi Sozlamalar → Telegram → «Bog‘lash» tugmasini bosing.",
      );
      return NextResponse.json({ ok: true });
    }

    const prefs = await prisma.notificationPreference.findFirst({
      where: {
        telegramLinkToken: payload,
        telegramLinkExpiresAt: { gt: new Date() },
      },
    });

    if (!prefs) {
      await sendTelegramMessage(
        chatIdStr,
        "Havola eskirgan yoki noto‘g‘ri. Saytdan yangi bog‘lash havolasini oling.",
      );
      return NextResponse.json({ ok: true });
    }

    // Bir chat faqat bitta hisobga
    await prisma.notificationPreference.updateMany({
      where: {
        telegramChatId: chatIdStr,
        NOT: { userId: prefs.userId },
      },
      data: {
        telegramChatId: null,
        telegramEnabled: false,
      },
    });

    await prisma.notificationPreference.update({
      where: { userId: prefs.userId },
      data: {
        telegramChatId: chatIdStr,
        telegramEnabled: true,
        telegramLinkToken: null,
        telegramLinkExpiresAt: null,
      },
    });

    await sendTelegramMessage(
      chatIdStr,
      "Hisobingiz bog‘landi. Endi yangi mavzu, topshiriq va izohlar shu yerga keladi.\n\nO‘chirish: saytda Sozlamalar → Telegramni uzish.",
    );
    return NextResponse.json({ ok: true });
  }

  if (text === "/help") {
    await sendTelegramMessage(
      chatIdStr,
      "Buyruqlar:\n/start — bog‘lash\n/status — holat\n/stop — bildirishnomalarni o‘chirish",
    );
    return NextResponse.json({ ok: true });
  }

  if (text === "/status") {
    const prefs = await prisma.notificationPreference.findFirst({
      where: { telegramChatId: chatIdStr },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!prefs) {
      await sendTelegramMessage(chatIdStr, "Bu chat hali hech qanday hisobga bog‘lanmagan.");
    } else {
      await sendTelegramMessage(
        chatIdStr,
        `Bog‘langan: ${prefs.user.name} (${prefs.user.email})\nBildirishnoma: ${prefs.telegramEnabled ? "yoqilgan" : "o‘chirilgan"}`,
      );
    }
    return NextResponse.json({ ok: true });
  }

  if (text === "/stop") {
    await prisma.notificationPreference.updateMany({
      where: { telegramChatId: chatIdStr },
      data: { telegramEnabled: false },
    });
    await sendTelegramMessage(
      chatIdStr,
      "Telegram bildirishnomalar o‘chirildi. Qayta yoqish: sayt sozlamalari.",
    );
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
