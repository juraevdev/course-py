"use client";

import { useEffect } from "react";

/** Tema: flash-siz lokal holat. Root layout Script o‘rniga — HMR loopdan qochish. */
export function ThemeBoot() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem("kurs-theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      const dark = stored === "dark" || (!stored && prefersDark);
      document.documentElement.classList.toggle("dark", dark);
    } catch {
      /* ignore */
    }
  }, []);

  return null;
}
