import Link from "next/link";
import { SignOut } from "@phosphor-icons/react/dist/ssr";
import { logoutAction } from "@/lib/auth-actions";
import { ThemeBoot } from "./theme-script";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui";

export function AppNav({
  links,
  name,
}: {
  links: { href: string; label: string }[];
  name: string;
}) {
  return (
    <>
      <ThemeBoot />
      <nav className="hidden items-center gap-1 lg:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-[6px] px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-1 sm:gap-2">
        <span className="hidden text-sm text-[var(--muted)] xl:inline">
          {name}
        </span>
        <ThemeToggle />
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" aria-label="Chiqish">
            <SignOut weight="bold" size={18} />
          </Button>
        </form>
      </div>
    </>
  );
}
