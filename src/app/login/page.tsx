import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { Panel } from "@/components/ui";
import { redirectIfAuthed } from "@/lib/guard";

export default async function LoginPage() {
  await redirectIfAuthed();

  return (
    <div className="relative min-h-screen bg-[var(--canvas)]">
      <div className="ambient" aria-hidden />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <Link
          href="/"
          className="mb-8 font-[family-name:var(--font-display)] text-2xl tracking-[-0.03em] text-[var(--ink)]"
        >
          Kurs
        </Link>
        <Panel>
          <h1 className="text-2xl font-medium tracking-[-0.02em] text-[var(--ink)]">
            Kirish
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            O‘qituvchi yoki o‘quvchi hisobi bilan kiring.
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
          <div className="mt-8 border-t border-[var(--line)] pt-5 text-xs leading-relaxed text-[var(--muted)]">
            <p className="font-[family-name:var(--font-mono)]">Demo:</p>
            <p className="mt-1">oqituvchi@kurs.uz / kurs1234</p>
            <p>jasur@kurs.uz / kurs1234</p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
