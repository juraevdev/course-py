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

  const uploadsRoot = path.resolve(process.cwd(), "uploads");
  const relative = submission.filePath.replace(/^uploads[\\/]/, "");
  const absolute = path.resolve(uploadsRoot, ...relative.split(/[\\/]/));

  if (
    absolute !== uploadsRoot &&
    !absolute.startsWith(uploadsRoot + path.sep)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await readFile(absolute);
  const safeName = submission.fileName.replace(/["\r\n]/g, "_");

  return new NextResponse(data, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
