"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";

export function SearchBox({ placeholder = "Qidirish..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  return (
    <label className="relative block max-w-md">
      <MagnifyingGlass
        weight="bold"
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
      />
      <input
        type="search"
        name="q"
        defaultValue={params.get("q") || ""}
        placeholder={placeholder}
        onChange={(e) => {
          const value = e.target.value;
          start(() => {
            const next = new URLSearchParams(params.toString());
            if (value) next.set("q", value);
            else next.delete("q");
            router.replace(`${pathname}?${next.toString()}`);
          });
        }}
        className="w-full rounded-[6px] border border-[var(--line)] bg-[var(--surface)] py-2.5 pl-9 pr-3 text-sm text-[var(--ink)] outline-none placeholder:text-[#A8A29E] focus:border-[#C9C9C9]"
      />
      {pending ? (
        <span className="sr-only">Qidirilmoqda</span>
      ) : null}
    </label>
  );
}
