import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".java",
  ".cpp",
  ".c",
  ".cs",
  ".go",
  ".rs",
  ".php",
  ".html",
  ".css",
  ".json",
  ".md",
  ".txt",
]);

export async function saveSubmissionFile(
  studentId: string,
  assignmentId: string,
  file: File,
) {
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED.has(ext)) {
    throw new Error("Faqat kod fayllari (.js, .py, .ts, …) yuklash mumkin.");
  }
  if (file.size > 512 * 1024) {
    throw new Error("Fayl 512 KB dan katta bo‘lmasin.");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const dir = path.join(process.cwd(), "uploads", studentId, assignmentId);
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return {
    fileName: safeName,
    filePath: path.join("uploads", studentId, assignmentId, safeName),
  };
}
