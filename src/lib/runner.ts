export type RunResult = {
  ok: boolean;
  stdout: string;
  stderr: string;
  timed_out: boolean;
  exit_code: number | null;
  error: string | null;
};

const RUNNER_URL =
  process.env.PYTHON_RUNNER_URL || "http://127.0.0.1:8015";
const RUNNER_KEY = process.env.RUNNER_API_KEY || "";

export async function runPythonCode(
  code: string,
  stdin = "",
): Promise<RunResult> {
  const upstreamHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (RUNNER_KEY) {
    upstreamHeaders["X-Runner-Key"] = RUNNER_KEY;
  }

  try {
    const upstream = await fetch(`${RUNNER_URL}/api/run/`, {
      method: "POST",
      headers: upstreamHeaders,
      body: JSON.stringify({
        code,
        stdin,
        language: "python",
      }),
      signal: AbortSignal.timeout(20000),
    });

    const data = (await upstream.json()) as Partial<RunResult> & {
      detail?: string;
    };

    return {
      ok: Boolean(data.ok),
      stdout: data.stdout || "",
      stderr: data.stderr || data.detail || "",
      timed_out: Boolean(data.timed_out),
      exit_code: data.exit_code ?? null,
      error: data.error ?? null,
    };
  } catch {
    return {
      ok: false,
      stdout: "",
      stderr: "",
      timed_out: false,
      exit_code: null,
      error: "Python runner ishlamayapti.",
    };
  }
}

export function normalizeStdout(value: string) {
  return value.replace(/\r\n/g, "\n").replace(/\s+$/g, "").trimEnd();
}
