import { PageIntro, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { Role } from "@prisma/client";

export default async function StudentSettingsPage() {
  const user = await requireUser(Role.STUDENT);
  if (!user) return null;

  return (
    <>
      <PageIntro
        eyebrow="Profil"
        title="Sozlamalar"
        description="Hisob ma’lumotlari. Bildirishnomalar faqat sayt ichida."
      />
      <Panel className="max-w-xl space-y-4">
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
    </>
  );
}
