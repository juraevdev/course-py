import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { Role } from "@prisma/client";

const RUNNER_URL =
  process.env.PYTHON_RUNNER_URL || "http://127.0.0.1:8000";

export async function POST(request: Request) {
  const user = await requireUser(Role.STUDENT);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  try {
    const upstream = await fetch(`${RUNNER_URL}/api/run/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        stdin: typeof body.stdin === "string" ? body.stdin : "",
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
        error:
          "Python runner ishlamayapti. backend da: python manage.py runserver 8000",
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
