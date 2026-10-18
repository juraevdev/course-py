"use client";

import { useEffect } from "react";

export function RevealObserver() {
  useEffect(() => {
    const motionOk = window.matchMedia(
      "(prefers-reduced-motion: no-preference)",
    ).matches;

    const elements = document.querySelectorAll(".reveal");

    if (!motionOk) {
      elements.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -4% 0px" },
    );

    elements.forEach((el) => observer.observe(el));

    const fallback = window.setTimeout(() => {
      document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
        el.classList.add("is-visible");
      });
    }, 500);

    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, []);

  return null;
}
