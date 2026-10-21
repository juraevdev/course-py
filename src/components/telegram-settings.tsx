"use client";

import { useActionState, useState } from "react";
import {
  createTelegramLinkAction,
  setTelegramEnabledAction,
  unlinkTelegramAction,
  type ActionState,
} from "@/lib/telegram-actions";
import { Button } from "./ui";

const initial: ActionState = {};

export function TelegramSettingsCard({
  configured,
  botUsername,
  linked,
  enabled,
  chatId,
}: {
  configured: boolean;
  botUsername: string;
  linked: boolean;
  enabled: boolean;
  chatId?: string | null;
}) {
  const [linkState, setLinkState] = useState<ActionState>({});
  const [linkPending, setLinkPending] = useState(false);
  const [unlinkPending, setUnlinkPending] = useState(false);
  const [toggleState, toggleAction, togglePending] = useActionState(
    setTelegramEnabledAction,
    initial,
  );

  async function onLink() {
    setLinkPending(true);
    setLinkState({});
    try {
      const result = await createTelegramLinkAction();
      setLinkState(result);
      if (result.deepLink) {
        window.open(result.deepLink, "_blank", "noopener,noreferrer");
      }
    } finally {
      setLinkPending(false);
    }
  }

  async function onUnlink() {
    if (!window.confirm("Telegram bog‘lanishini uzasizmi?")) return;
    setUnlinkPending(true);
    try {
      const result = await unlinkTelegramAction();
      setLinkState(result);
    } finally {
      setUnlinkPending(false);
    }
  }

  if (!configured) {
    return (
      <p className="text-sm text-[var(--muted)]">
        Telegram bot serverda hali sozlanmagan. Admin `TELEGRAM_BOT_TOKEN` ni
        qo‘shishi kerak.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-[var(--muted)]">Bot:</span>
        <span className="font-[family-name:var(--font-mono)] text-[var(--ink)]">
          @{botUsername || "…"}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.05em] ${
            linked
              ? "bg-[#EDF3EC] text-[#346538]"
              : "bg-[#FBF3DB] text-[#956400]"
          }`}
        >
          {linked ? "Bog‘langan" : "Bog‘lanmagan"}
        </span>
        {linked ? (
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.05em] ${
              enabled
                ? "bg-[#E1F3FE] text-[#1F6C9F]"
                : "bg-[#F7F6F3] text-[var(--muted)]"
            }`}
          >
            {enabled ? "Yoqilgan" : "O‘chirilgan"}
          </span>
        ) : null}
      </div>

      {linked && chatId ? (
        <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
          chat_id: {chatId}
        </p>
      ) : null}

      <p className="text-sm text-[var(--muted)]">
        Yangi mavzu, topshiriq, izoh va savol javoblari Telegramga ham keladi.
      </p>

      <div className="flex flex-wrap gap-2">
        {!linked ? (
          <Button type="button" onClick={onLink} disabled={linkPending}>
            {linkPending ? "..." : "Telegramni bog‘lash"}
          </Button>
        ) : (
          <>
            <form action={toggleAction}>
              <input
                type="hidden"
                name="enabled"
                value={enabled ? "0" : "1"}
              />
              <Button type="submit" variant="secondary" disabled={togglePending}>
                {togglePending
                  ? "..."
                  : enabled
                    ? "Bildirishnomani o‘chirish"
                    : "Bildirishnomani yoqish"}
              </Button>
            </form>
            <Button
              type="button"
              variant="ghost"
              onClick={onUnlink}
              disabled={unlinkPending}
              className="!text-[#9F2F2D]"
            >
              {unlinkPending ? "..." : "Uzish"}
            </Button>
            <Button type="button" variant="ghost" onClick={onLink} disabled={linkPending}>
              Qayta bog‘lash
            </Button>
          </>
        )}
      </div>

      {linkState.deepLink ? (
        <p className="break-all text-sm text-[var(--body)]">
          Agar oyna ochilmasa:{" "}
          <a
            href={linkState.deepLink}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline"
          >
            {linkState.deepLink}
          </a>
        </p>
      ) : null}

      {linkState.error || toggleState.error ? (
        <p className="rounded-[6px] bg-[#FDEBEC] px-3 py-2 text-sm text-[#9F2F2D]">
          {linkState.error || toggleState.error}
        </p>
      ) : null}
      {linkState.success || toggleState.success ? (
        <p className="rounded-[6px] bg-[#EDF3EC] px-3 py-2 text-sm text-[#346538]">
          {linkState.success || toggleState.success}
        </p>
      ) : null}
    </div>
  );
}
