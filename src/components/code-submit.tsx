"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, CopySimple, Play } from "@phosphor-icons/react";
import { submitAssignmentAction, type ActionState } from "@/lib/actions";
import { PythonEditor } from "./python-editor";
import { Button } from "./ui";

const initial: ActionState = {};
const MAX_INPUT_ROUNDS = 24;

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

function isWaitingForInput(result: RunResult): boolean {
  const blob = `${result.stderr || ""}\n${result.error || ""}`;
  return /EOFError|EOF when reading a line/i.test(blob);
}

async function requestRun(code: string, stdin: string): Promise<RunResult> {
  const res = await fetch("/api/run-python", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, stdin }),
  });
  const data = (await res.json()) as RunResult & { error?: string };
  return {
    ok: Boolean(data.ok),
    stdout: data.stdout || "",
    stderr: data.stderr || "",
    timed_out: data.timed_out,
    error: data.error,
  };
}

export function CodeSubmitForm({
  assignmentId,
  defaultValue,
  defaultKind,
  lockKind,
  fileName,
}: {
  assignmentId: string;
  defaultValue?: string;
  defaultKind?: string | null;
  lockKind?: Mode | null;
  fileName?: string | null;
}) {
  const initialMode = lockKind || detectMode(defaultValue, defaultKind);
  const [mode, setMode] = useState<Mode>(initialMode);
  // Javob va kod alohida — biridan ikkinchisiga o‘tishda aralashmasin
  const [textContent, setTextContent] = useState(
    initialMode === "TEXT" ? defaultValue || "" : "",
  );
  const [codeContent, setCodeContent] = useState(
    initialMode === "CODE" ? defaultValue || "" : "",
  );
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [awaitingInput, setAwaitingInput] = useState(false);
  const [stdinAcc, setStdinAcc] = useState("");
  const [liveLine, setLiveLine] = useState("");
  const [inputRounds, setInputRounds] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, action, pending] = useActionState(
    submitAssignmentAction,
    initial,
  );

  const content = mode === "CODE" ? codeContent : textContent;

  const accept = useMemo(
    () => (mode === "CODE" ? ".py,.txt" : ".txt,.md,.pdf"),
    [mode],
  );

  useEffect(() => {
    if (awaitingInput && !running) {
      inputRef.current?.focus();
    }
  }, [awaitingInput, running, runResult]);

  async function copyCode() {
    if (!codeContent) return;
    await navigator.clipboard.writeText(codeContent);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function resetTerminal() {
    setRunResult(null);
    setAwaitingInput(false);
    setStdinAcc("");
    setLiveLine("");
    setInputRounds(0);
  }

  async function executeWithStdin(stdin: string, rounds: number) {
    setRunning(true);
    try {
      const data = await requestRun(codeContent, stdin);
      if (isWaitingForInput(data) && rounds < MAX_INPUT_ROUNDS) {
        setRunResult({
          ...data,
          stderr: "",
          error: null,
          ok: true,
        });
        setAwaitingInput(true);
        setStdinAcc(stdin);
        setInputRounds(rounds);
        setLiveLine("");
      } else if (isWaitingForInput(data)) {
        setRunResult({
          ok: false,
          stdout: data.stdout || "",
          stderr: "",
          error: "Juda ko‘p input() chaqiruvi. Kodni tekshiring.",
        });
        setAwaitingInput(false);
      } else {
        setRunResult(data);
        setAwaitingInput(false);
        setStdinAcc(stdin);
      }
    } catch {
      setRunResult({
        ok: false,
        stdout: "",
        stderr: "",
        error: "So‘rov yuborilmadi. Django runner ishlayotganini tekshiring.",
      });
      setAwaitingInput(false);
    } finally {
      setRunning(false);
    }
  }

  async function runPython() {
    resetTerminal();
    await executeWithStdin("", 0);
  }

  async function submitInteractiveLine() {
    if (!awaitingInput || running) return;
    const next = `${stdinAcc}${liveLine}\n`;
    setLiveLine("");
    await executeWithStdin(next, inputRounds + 1);
  }

  const statusLabel = running
    ? "Ishlamoqda..."
    : awaitingInput
      ? "Kiritish kutilmoqda"
      : runResult
        ? runResult.ok
          ? "OK"
          : "Xato"
        : null;

  return (
    <form action={action} className="space-y-5">
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
        )
          .filter((item) => !lockKind || lockKind === item.id)
          .map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              if (lockKind) return;
              setMode(item.id);
              resetTerminal();
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
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
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
                disabled={running || !codeContent.trim()}
              >
                <Play weight="fill" size={14} />
                {running && !awaitingInput ? "Ishlamoqda..." : "Run"}
              </Button>
            </div>
          </div>

          <PythonEditor
            name="codePreview"
            value={codeContent}
            onChange={(value) => {
              setCodeContent(value);
              if (awaitingInput) resetTerminal();
            }}
          />

          {runResult || running || awaitingInput ? (
            <div className="rounded-[8px] border border-[var(--line)] bg-[var(--canvas)] p-3">
              <p className="mb-2 text-xs uppercase tracking-[0.06em] text-[var(--muted)]">
                Terminal{statusLabel ? ` · ${statusLabel}` : ""}
              </p>
              {runResult?.error ? (
                <p className="mb-2 text-sm text-[#9F2F2D]">{runResult.error}</p>
              ) : null}
              {runResult?.stdout ? (
                <pre className="overflow-x-auto whitespace-pre-wrap font-[family-name:var(--font-mono)] text-[13px] text-[var(--ink)]">
                  {runResult.stdout}
                </pre>
              ) : null}
              {awaitingInput ? (
                <div className="mt-2 flex items-center gap-2 border-t border-[var(--line)] pt-2">
                  <span className="font-[family-name:var(--font-mono)] text-[13px] text-[var(--muted)]">
                    ›
                  </span>
                  <input
                    ref={inputRef}
                    value={liveLine}
                    disabled={running}
                    onChange={(e) => setLiveLine(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void submitInteractiveLine();
                      }
                    }}
                    placeholder="Qiymat yozing, Enter"
                    className="min-w-0 flex-1 bg-transparent font-[family-name:var(--font-mono)] text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
              ) : null}
              {!awaitingInput && runResult?.stderr ? (
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-[family-name:var(--font-mono)] text-[13px] text-[#9F2F2D]">
                  {runResult.stderr}
                </pre>
              ) : null}
              {!running &&
              !awaitingInput &&
              runResult &&
              !runResult.stdout &&
              !runResult.stderr &&
              !runResult.error ? (
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
