import Link from "next/link";
import { Bell } from "@phosphor-icons/react/dist/ssr";
import {
  markAllNotificationsReadAction,
  markNotificationReadFormAction,
} from "@/lib/actions";
import { formatRelative } from "@/lib/format";
import { Button, EmptyState, Panel, StatusTag } from "./ui";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  createdAt: Date;
};

export function NotificationList({ items }: { items: NotificationItem[] }) {
  if (!items.length) {
    return (
      <EmptyState
        title="Bildirishnomalar yo‘q"
        description="Yangi mavzu yoki topshiriq chiqqanda shu yerda ko‘rinadi."
      />
    );
  }

  return (
    <div className="space-y-3">
      <form action={markAllNotificationsReadAction} className="flex justify-end">
        <Button type="submit" variant="ghost">
          Hammasini o‘qilgan qilish
        </Button>
      </form>
      {items.map((item, index) => (
        <Panel key={item.id} index={index} className="!p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#E1F3FE] text-[#1F6C9F]">
                <Bell weight="bold" size={18} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-medium text-[var(--ink)]">
                    {item.title}
                  </h3>
                  {!item.read ? <StatusTag tone="blue">Yangi</StatusTag> : null}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                  {item.body}
                </p>
                <p className="mt-2 font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                  {formatRelative(item.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              {item.href ? (
                <Link
                  href={item.href}
                  className="inline-flex items-center justify-center rounded-[6px] border border-[var(--line)] bg-[var(--btn-secondary-bg)] px-4 py-2.5 text-sm font-medium text-[var(--btn-secondary-fg)] transition hover:bg-[var(--btn-secondary-hover)]"
                >
                  Ochish
                </Link>
              ) : null}
              {!item.read ? (
                <form action={markNotificationReadFormAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <Button type="submit" variant="ghost">
                    O‘qildi
                  </Button>
                </form>
              ) : null}
            </div>
          </div>
        </Panel>
      ))}
    </div>
  );
}
