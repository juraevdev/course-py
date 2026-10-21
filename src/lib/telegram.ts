const TOKEN = () => process.env.TELEGRAM_BOT_TOKEN?.trim() || "";
const SECRET = () => process.env.TELEGRAM_WEBHOOK_SECRET?.trim() || "";
const APP_URL = () =>
  (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "").replace(
    /\/$/,
    "",
  );

export function telegramConfigured() {
  return Boolean(TOKEN());
}

export function telegramBotUsername() {
  return (process.env.TELEGRAM_BOT_USERNAME || "").replace(/^@/, "").trim();
}

export function appPublicUrl() {
  return APP_URL() || "https://python.buildup.uz";
}

export function verifyTelegramWebhookSecret(headerValue: string | null) {
  const expected = SECRET();
  if (!expected) return true; // secret ixtiyoriy (dev)
  return Boolean(headerValue && headerValue === expected);
}

type TelegramApiResult = {
  ok: boolean;
  description?: string;
  result?: unknown;
};

async function telegramApi(
  method: string,
  body?: Record<string, unknown>,
): Promise<TelegramApiResult> {
  const token = TOKEN();
  if (!token) {
    return { ok: false, description: "TELEGRAM_BOT_TOKEN yo‘q." };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(12000),
    });
    return (await res.json()) as TelegramApiResult;
  } catch (error) {
    return {
      ok: false,
      description:
        error instanceof Error ? error.message : "Telegram so‘rovi muvaffaqiyatsiz.",
    };
  }
}

export async function sendTelegramMessage(chatId: string, text: string) {
  return telegramApi("sendMessage", {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
  });
}

export function buildTelegramDeepLink(token: string) {
  const username = telegramBotUsername();
  if (!username) return null;
  return `https://t.me/${username}?start=${token}`;
}

export async function fetchBotUsername(): Promise<string | null> {
  const data = await telegramApi("getMe");
  if (!data.ok || !data.result || typeof data.result !== "object") return null;
  const username = (data.result as { username?: string }).username;
  return username || null;
}
