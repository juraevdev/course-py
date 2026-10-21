import { TelegramSettingsCard } from "@/components/telegram-settings";
import { PageIntro, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  telegramBotUsername,
  telegramConfigured,
} from "@/lib/telegram";
import { Role } from "@prisma/client";

export default async function StudentSettingsPage() {
  const user = await requireUser(Role.STUDENT);
  if (!user) return null;

  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId: user.id },
  });

  return (
    <>
      <PageIntro
        eyebrow="Profil"
        title="Sozlamalar"
        description="Hisob va Telegram bildirishnomalar."
      />
      <div className="grid max-w-2xl gap-6">
        <Panel className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.06em] text-[var(--muted)]">
              Ism
            </p>
            <p className="mt-1 text-[var(--ink)]">{user.name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.06em] text-[var(--muted)]">
              Email
            </p>
            <p className="mt-1 font-[family-name:var(--font-mono)] text-sm text-[var(--ink)]">
              {user.email}
            </p>
          </div>
          <p className="text-sm text-[var(--muted)]">
            Parolni o‘zgartirish uchun o‘qituvchiga murojaat qiling.
          </p>
        </Panel>

        <Panel>
          <h2 className="mb-4 text-lg font-medium">Telegram</h2>
          <TelegramSettingsCard
            configured={telegramConfigured()}
            botUsername={telegramBotUsername()}
            linked={Boolean(prefs?.telegramChatId)}
            enabled={Boolean(prefs?.telegramEnabled)}
            chatId={prefs?.telegramChatId}
          />
        </Panel>
      </div>
    </>
  );
}
