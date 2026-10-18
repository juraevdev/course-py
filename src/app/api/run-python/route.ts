import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const RUNNER_URL =
  process.env.PYTHON_RUNNER_URL || "http://127.0.0.1:8015";
const RUNNER_KEY = process.env.RUNNER_API_KEY || "";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    "unknown";
  const limited = await rateLimit(`run:${user.id}:${ip}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: `Juda ko‘p so‘rov. ${limited.retryAfterSec}s keyin qayta urinib ko‘ring.` },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  let body: { code?: string; stdin?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON kerak." }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code : "";
  if (!code.trim()) {
    return NextResponse.json({ error: "Kod bo‘sh." }, { status: 400 });
  }
  if (code.length > 20_000) {
    return NextResponse.json({ error: "Kod juda uzun." }, { status: 400 });
  }

  const stdin = typeof body.stdin === "string" ? body.stdin : "";
  if (stdin.length > 10_000) {
    return NextResponse.json({ error: "stdin juda uzun." }, { status: 400 });
  }

  try {
    const upstreamHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (RUNNER_KEY) {
      upstreamHeaders["X-Runner-Key"] = RUNNER_KEY;
    }

    const upstream = await fetch(`${RUNNER_URL}/api/run/`, {
      method: "POST",
      headers: upstreamHeaders,
      body: JSON.stringify({
        code,
        stdin,
        language: "python",
      }),
      signal: AbortSignal.timeout(15000),
    });

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Python runner ishlamayapti.",
        stdout: "",
        stderr: "",
        timed_out: false,
        exit_code: null,
        language: "python",
      },
      { status: 503 },
    );
  }
}
