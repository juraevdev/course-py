"use client";

import { useMemo, useRef } from "react";

const INDENT = "    ";

type Props = {
  name: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
};

export function PythonEditor({ name, value, onChange, rows = 14 }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const lineCount = useMemo(
    () => Math.max(value.split("\n").length, rows),
    [value, rows],
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) {
        const before = value.slice(0, start);
        const lineStart = before.lastIndexOf("\n") + 1;
        const selected = value.slice(lineStart, end);
        const lines = selected.split("\n");
        const dedented = lines
          .map((line) =>
            line.startsWith(INDENT)
              ? line.slice(INDENT.length)
              : line.startsWith("\t")
                ? line.slice(1)
                : line.replace(/^ {1,4}/, ""),
          )
          .join("\n");
        const next = value.slice(0, lineStart) + dedented + value.slice(end);
        const removed = selected.length - dedented.length;
        onChange(next);
        requestAnimationFrame(() => {
          el.selectionStart = Math.max(
            lineStart,
            start - Math.min(removed, INDENT.length),
          );
          el.selectionEnd = end - removed;
        });
      } else if (start !== end) {
        const before = value.slice(0, start);
        const lineStart = before.lastIndexOf("\n") + 1;
        const selected = value.slice(lineStart, end);
        const indented = selected
          .split("\n")
          .map((line) => INDENT + line)
          .join("\n");
        const next = value.slice(0, lineStart) + indented + value.slice(end);
        onChange(next);
        requestAnimationFrame(() => {
          el.selectionStart = start + INDENT.length;
          el.selectionEnd = end + INDENT.length * selected.split("\n").length;
        });
      } else {
        const next = value.slice(0, start) + INDENT + value.slice(end);
        onChange(next);
        requestAnimationFrame(() => {
          el.selectionStart = el.selectionEnd = start + INDENT.length;
        });
      }
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const line = value.slice(lineStart, start);
      const match = line.match(/^\s*/);
      let indent = match?.[0] || "";
      if (/:\s*$/.test(line.trimEnd())) {
        indent += INDENT;
      }
      const next = value.slice(0, start) + "\n" + indent + value.slice(end);
      onChange(next);
      requestAnimationFrame(() => {
        const pos = start + 1 + indent.length;
        el.selectionStart = el.selectionEnd = pos;
      });
    }
  }

  function syncScroll() {
    const gutter = document.getElementById("py-gutter");
    if (ref.current && gutter) {
      gutter.scrollTop = ref.current.scrollTop;
    }
  }

  return (
    <div className="overflow-hidden rounded-[6px] border border-[var(--line)] bg-[var(--canvas)]">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-1.5">
        <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
          main.py
        </span>
        <span className="text-[11px] text-[var(--muted)]">
          Tab — 4 bo‘sh joy · Enter — indent
        </span>
      </div>
      <div className="flex max-h-[420px] overflow-hidden">
        <div
          id="py-gutter"
          aria-hidden
          className="select-none overflow-hidden border-r border-[var(--line)] bg-[color-mix(in_srgb,var(--canvas)_80%,var(--ink)_4%)] px-2 py-3 text-right font-[family-name:var(--font-mono)] text-[12px] leading-relaxed text-[var(--muted)]"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <textarea
          ref={ref}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={syncScroll}
          rows={rows}
          required
          spellCheck={false}
          placeholder={'print("Salom")\nfor i in range(3):\n    print(i)'}
          className="min-w-0 flex-1 resize-y overflow-auto bg-transparent px-3 py-3 font-[family-name:var(--font-mono)] text-[13px] leading-relaxed text-[var(--ink)] outline-none"
        />
      </div>
    </div>
  );
}
