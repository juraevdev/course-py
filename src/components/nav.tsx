"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CaretDown, List, SignOut, X } from "@phosphor-icons/react";
import { logoutAction } from "@/lib/auth-actions";
import { ThemeBoot } from "./theme-script";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui";

type NavLink = { href: string; label: string };

function isActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href === "/teacher" || href === "/student") return false;
  return pathname.startsWith(href);
}

export function AppNav({
  links,
  moreLinks = [],
  name,
}: {
  links: NavLink[];
  moreLinks?: NavLink[];
  name: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelId = useId();
  const moreRef = useRef<HTMLDivElement>(null);
  const allLinks = [...links, ...moreLinks];
  const moreActive = moreLinks.some((link) => isActive(pathname, link.href));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!moreOpen) return;

    const onPointer = (event: MouseEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMoreOpen(false);
    };

    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  function linkClass(href: string, mobile = false) {
    const active = isActive(pathname, href);
    if (mobile) {
      return `block rounded-[6px] px-3 py-3 text-base transition ${
        active
          ? "bg-[var(--canvas)] font-medium text-[var(--ink)]"
          : "text-[var(--body)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
      }`;
    }
    return `rounded-[6px] px-3 py-2 text-sm transition ${
      active
        ? "bg-[var(--canvas)] font-medium text-[var(--ink)]"
        : "text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
    }`;
  }

  return (
    <>
      <ThemeBoot />
      <nav className="hidden items-center gap-1 lg:flex" aria-label="Asosiy">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={linkClass(link.href)}>
            {link.label}
          </Link>
        ))}
        {moreLinks.length ? (
          <div className="relative" ref={moreRef}>
            <button
              type="button"
              className={`inline-flex items-center gap-1 rounded-[6px] px-3 py-2 text-sm transition ${
                moreActive || moreOpen
                  ? "bg-[var(--canvas)] font-medium text-[var(--ink)]"
                  : "text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
              }`}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              onClick={() => setMoreOpen((value) => !value)}
            >
              Yana
              <CaretDown weight="bold" size={14} />
            </button>
            {moreOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-full z-30 mt-1 min-w-[11rem] rounded-[8px] border border-[var(--line)] bg-[var(--surface)] py-1 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
              >
                {moreLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    role="menuitem"
                    className={`block px-3 py-2.5 text-sm transition hover:bg-[var(--canvas)] ${
                      isActive(pathname, link.href)
                        ? "font-medium text-[var(--ink)]"
                        : "text-[var(--body)]"
                    }`}
                    onClick={() => setMoreOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </nav>

      <div className="flex items-center gap-1 sm:gap-2">
        <span className="hidden text-sm text-[var(--muted)] xl:inline">{name}</span>
        <ThemeToggle />
        <form action={logoutAction} className="hidden sm:block">
          <Button type="submit" variant="ghost" aria-label="Chiqish">
            <SignOut weight="bold" size={18} />
          </Button>
        </form>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] text-[var(--muted)] transition hover:bg-[var(--canvas)] hover:text-[var(--ink)] lg:hidden"
          aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X weight="bold" size={20} /> : <List weight="bold" size={20} />}
        </button>
      </div>

      {mounted && open
        ? createPortal(
            <div
              className="fixed inset-0 z-50 lg:hidden"
              role="dialog"
              aria-modal="true"
            >
              <button
                type="button"
                className="absolute inset-0 bg-[rgba(17,17,17,0.28)]"
                aria-label="Menyuni yopish"
                onClick={() => setOpen(false)}
              />
              <div
                id={panelId}
                className="nav-panel-enter absolute inset-y-0 right-0 flex w-[min(100%,20rem)] flex-col border-l border-[var(--line)] bg-[var(--surface)] shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
              >
                <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.06em] text-[var(--muted)]">
                      Menyu
                    </p>
                    <p className="mt-1 text-sm font-medium text-[var(--ink)]">
                      {name}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] text-[var(--muted)] transition hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
                    aria-label="Yopish"
                    onClick={() => setOpen(false)}
                  >
                    <X weight="bold" size={18} />
                  </button>
                </div>
                <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Mobil">
                  {allLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={linkClass(link.href, true)}
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="border-t border-[var(--line)] p-3">
                  <form action={logoutAction}>
                    <Button type="submit" variant="secondary" className="w-full">
                      <SignOut weight="bold" size={18} />
                      Chiqish
                    </Button>
                  </form>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
