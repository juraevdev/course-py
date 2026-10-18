"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "@phosphor-icons/react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("kurs-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = stored === "dark" || (!stored && prefersDark);
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("kurs-theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Yorug‘ tema" : "Qorong‘i tema"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] text-[var(--muted)] transition hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
    >
      {dark ? <Sun weight="bold" size={18} /> : <Moon weight="bold" size={18} />}
    </button>
  );
}
