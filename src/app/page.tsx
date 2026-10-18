import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { redirectIfAuthed } from "@/lib/guard";

export default async function HomePage() {
  await redirectIfAuthed();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--canvas)]">
      <div className="ambient" aria-hidden />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <p className="reveal font-[family-name:var(--font-display)] text-5xl tracking-[-0.04em] text-[var(--ink)] md:text-7xl">
          Kurs
        </p>
        <h1 className="reveal mt-6 max-w-xl text-2xl leading-snug tracking-[-0.02em] text-[var(--body)] md:text-3xl">
          Dasturlash kursi — offline darsning raqamli davomi.
        </h1>
        <p
          className="reveal mt-4 max-w-lg text-base leading-relaxed text-[var(--muted)]"
          style={{ ["--index" as string]: 1 }}
        >
          Har bir o‘quvchining o‘z hisobi bor. O‘qituvchi kod misollari, mavzu
          va topshiriq joylaydi — bildirishnoma sifatida yetib boradi. Asosiy
          dars offline; sayt resurs va amaliyot uchun.
        </p>
        <div
          className="reveal mt-10 flex flex-wrap gap-3"
          style={{ ["--index" as string]: 2 }}
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-[6px] bg-[var(--btn-bg)] px-5 py-3 text-sm font-medium text-[var(--btn-fg)] transition hover:bg-[var(--btn-hover)] active:scale-[0.98]"
          >
            Hisobga kirish
            <ArrowRight weight="bold" size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
