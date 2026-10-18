"use client";

import { useActionState, useMemo, useState } from "react";
import { Check, CopySimple, Play } from "@phosphor-icons/react";
import { submitAssignmentAction, type ActionState } from "@/lib/actions";
import { PythonEditor } from "./python-editor";
import { Button } from "./ui";

const initial: ActionState = {};

type Mode = "TEXT" | "CODE";

type RunResult = {
  ok: boolean;
  stdout: string;
  stderr: string;
  timed_out?: boolean;
  error?: string | null;
};

function detectMode(value?: string, kind?: string | null): Mode {
  if (kind === "CODE") return "CODE";
  if (kind === "TEXT") return "TEXT";
  if (!value) return "TEXT";
  if (
    /^(def |class |import |from |print\(|for |while |if )/m.test(value) ||
    value.includes("    ")
  ) {
    return "CODE";
  }
  return "TEXT";
}

export function CodeSubmitForm({
  assignmentId,
  defaultValue,
  defaultKind,
  fileName,
}: {
  assignmentId: string;
  defaultValue?: string;
  defaultKind?: string | null;
  fileName?: string | null;
}) {
  const [mode, setMode] = useState<Mode>(() =>
    detectMode(defaultValue, defaultKind),
  );
  const [content, setContent] = useState(defaultValue || "");
  const [stdin, setStdin] = useState("");
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);

  const [state, action, pending] = useActionState(
    submitAssignmentAction,
    initial,
  );

  const accept = useMemo(
    () => (mode === "CODE" ? ".py,.txt" : ".txt,.md,.pdf"),
    [mode],
  );

  async function copyCode() {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  async function runPython() {
    setRunning(true);
    setRunResult(null);
    try {
      const res = await fetch("/api/run-python", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: content, stdin }),
      });
      const data = (await res.json()) as RunResult & { error?: string };
      setRunResult({
        ok: Boolean(data.ok),
        stdout: data.stdout || "",
        stderr: data.stderr || "",
        timed_out: data.timed_out,
        error: data.error,
      });
    } catch {
      setRunResult({
        ok: false,
        stdout: "",
        stderr: "",
        error: "So‘rov yuborilmadi. Django runner ishlayotganini tekshiring.",
      });
    } finally {
      setRunning(false);
    }
  }

  return (
    <form action={action} className="space-y-5" encType="multipart/form-data">
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <input type="hidden" name="kind" value={mode} />
      <input type="hidden" name="content" value={content} />

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-medium text-[var(--ink)]">Tur:</span>
        {(
          [
            { id: "TEXT", label: "Javob" },
            { id: "CODE", label: "Kod (Python)" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setMode(item.id);
              setRunResult(null);
            }}
            className={`rounded-[6px] px-3 py-1.5 text-sm transition ${
              mode === item.id
                ? "bg-[var(--btn-bg)] text-[var(--btn-fg)]"
                : "border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {mode === "TEXT" ? (
        <label className="block">
          <span className="text-sm font-medium text-[var(--ink)]">
            Yozma javob
          </span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            required
            placeholder="Javobingizni shu yerga yozing..."
            className="mt-2 w-full rounded-[6px] border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3 text-sm leading-relaxed text-[var(--ink)] outline-none focus:border-[#C9C9C9]"
          />
        </label>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium text-[var(--ink)]">
              Python editor
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={copyCode}
                className="inline-flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-xs text-[var(--muted)] transition hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
              >
                {copied ? (
                  <>
                    <Check weight="bold" size={14} /> Nusxa olindi
                  </>
                ) : (
                  <>
                    <CopySimple weight="bold" size={14} /> Nusxa olish
                  </>
                )}
              </button>
              <Button
                type="button"
                variant="secondary"
                onClick={runPython}
                disabled={running || !content.trim()}
              >
                <Play weight="fill" size={14} />
                {running ? "Ishlamoqda..." : "Run"}
              </Button>
            </div>
          </div>

          <PythonEditor name="codePreview" value={content} onChange={setContent} />

          <label className="block">
            <span className="text-xs uppercase tracking-[0.06em] text-[var(--muted)]">
              stdin (ixtiyoriy)
            </span>
            <input
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="input() uchun qiymatlar"
              className="mt-1.5 w-full rounded-[6px] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm outline-none"
            />
          </label>

          {runResult ? (
            <div className="rounded-[6px] border border-[var(--line)] bg-[var(--canvas)] p-3">
              <p className="mb-2 text-xs uppercase tracking-[0.06em] text-[var(--muted)]">
                Natija {runResult.ok ? "· OK" : "· Xato"}
              </p>
              {runResult.error ? (
                <p className="mb-2 text-sm text-[#9F2F2D]">{runResult.error}</p>
              ) : null}
              {runResult.stdout ? (
                <pre className="overflow-x-auto whitespace-pre-wrap font-[family-name:var(--font-mono)] text-[13px] text-[var(--ink)]">
                  {runResult.stdout}
                </pre>
              ) : null}
              {runResult.stderr ? (
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-[family-name:var(--font-mono)] text-[13px] text-[#9F2F2D]">
                  {runResult.stderr}
                </pre>
              ) : null}
              {!runResult.stdout && !runResult.stderr && !runResult.error ? (
                <p className="text-sm text-[var(--muted)]">(chiqish yo‘q)</p>
              ) : null}
            </div>
          ) : null}
        </div>
      )}

      <label className="block">
        <span className="text-sm font-medium text-[var(--ink)]">
          Fayl yuklash (ixtiyoriy)
        </span>
        <input
          type="file"
          name="file"
          accept={accept}
          className="mt-2 block w-full text-sm text-[var(--muted)] file:mr-3 file:rounded-[6px] file:border file:border-[var(--line)] file:bg-[var(--canvas)] file:px-3 file:py-1.5 file:text-sm file:text-[var(--ink)]"
        />
        {fileName ? (
          <p className="mt-2 text-xs text-[var(--muted)]">
            Oldingi fayl: {fileName}
          </p>
        ) : null}
      </label>

      {state.error ? (
        <p className="rounded-[6px] bg-[#FDEBEC] px-3 py-2 text-sm text-[#9F2F2D]">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-[6px] bg-[#EDF3EC] px-3 py-2 text-sm text-[#346538]">
          {state.success}
        </p>
      ) : null}

      <Button type="submit" disabled={pending || !content.trim()}>
        {pending ? "Saqlanmoqda..." : "Javobni yuborish"}
      </Button>
    </form>
  );
}
