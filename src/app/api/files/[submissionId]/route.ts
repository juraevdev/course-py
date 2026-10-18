import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET(
  _request: Request,
  context: { params: Promise<{ submissionId: string }> },
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { submissionId } = await context.params;
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
  });

  if (!submission?.filePath || !submission.fileName) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const allowed =
    user.role === Role.TEACHER || submission.studentId === user.id;
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const absolute = path.join(
    /* turbopackIgnore: true */ process.cwd(),
    "uploads",
    ...submission.filePath.replace(/^uploads[\\/]/, "").split(/[\\/]/),
  );
  const data = await readFile(absolute);

  return new NextResponse(data, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${submission.fileName}"`,
    },
  });
}
