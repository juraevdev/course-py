/**
 * kurs_materiallari.md dan bitta mavzuni DB ga qo'shadi/yangilaydi.
 * Mavjud topshiriqlarni o'chirmaydi — faqat title bo'yicha yetishmaganlarini qo'shadi.
 *
 *   npx tsx scripts/upsert-topic-from-md.ts "7-mavzu: if / elif / else"
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { AnswerKind, PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

type AssignmentDraft = {
  title: string;
  description: string;
  answerKind: "TEXT" | "CODE";
};

function parseAssignmentBlock(block: string): AssignmentDraft | null {
  const titleMatch = block.match(
    /^###\s+(?:Topshiriq|Takrorlash)\s+[\d.]+:\s*(.+)$/m,
  );
  if (!titleMatch) return null;

  const title = titleMatch[1].trim();
  const field = (name: string) => {
    const re = new RegExp(
      `- \\*\\*${name}:\\*\\*\\s*([\\s\\S]*?)(?=\\n- \\*\\*|$)`,
    );
    const m = block.match(re);
    return m ? m[1].trim() : "";
  };

  const turi = field("Turi");
  const qiyinlik = field("Qiyinlik");
  const shart = field("Shart");
  const maslahat = field("Maslahat");
  const natija = field("Kutilgan natija");

  const lines: string[] = [];
  if (turi) lines.push(`Turi: ${turi}`);
  if (qiyinlik) lines.push(`Qiyinlik: ${qiyinlik}`);
  if (lines.length) lines.push("");
  lines.push("Shart:", shart || "(shart yo‘q)");
  if (maslahat) lines.push("", "Maslahat:", maslahat);
  if (natija) lines.push("", "Kutilgan natija:", natija);

  const kindLower = turi.toLowerCase();
  const answerKind =
    kindLower.includes("kod") || kindLower.includes("loyiha")
      ? "CODE"
      : "TEXT";

  return { title, description: lines.join("\n"), answerKind };
}

function sectionBody(chunk: string, heading: string): string {
  const re = new RegExp(
    `##\\s+${heading}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|\\n###\\s+|$)`,
  );
  return chunk.match(re)?.[1].trim() || "";
}

function firstUrl(text: string): string | null {
  const m = text.match(/https?:\/\/[^\s)\]]+/);
  return m ? m[0] : null;
}

function extractTopic(md: string, titlePrefix: string) {
  const start = md.search(
    new RegExp(`^#\\s+${escapeReg(titlePrefix)}`, "m"),
  );
  if (start < 0) throw new Error(`Mavzu topilmadi: ${titlePrefix}`);
  const rest = md.slice(start);
  const next = rest.slice(1).search(/\n# /);
  const chunk = next >= 0 ? rest.slice(0, next + 1) : rest;

  const titleMatch = chunk.match(/^#\s+(.+)$/m);
  if (!titleMatch) throw new Error("Title yo‘q");
  const title = titleMatch[1].trim();

  const summary =
    chunk
      .match(/##\s+Qisqacha mazmun\s*\n([\s\S]*?)(?=\n##\s+)/)?.[1]
      .trim() || title;

  const contentParts: string[] = [];
  const tushuntirish = sectionBody(chunk, "Qo'shimcha tushuntirish");
  if (tushuntirish) {
    contentParts.push(`Qo'shimcha tushuntirish\n\n${tushuntirish}`);
  }
  for (const h of [
    "Asosiy tushunchalar",
    "Kod namunalari",
    "Tez-tez uchraydigan xatolar",
    "Resurslar",
  ]) {
    const bodySec = sectionBody(chunk, h);
    if (bodySec) contentParts.push(`${h}\n\n${bodySec}`);
  }

  const resourceSection = sectionBody(chunk, "Resurslar");
  const resourceUrl = resourceSection ? firstUrl(resourceSection) : null;

  const assignBlocks = chunk
    .split(/\n(?=###\s+(?:Topshiriq|Takrorlash)\s+)/)
    .filter((b) => /^###\s+(?:Topshiriq|Takrorlash)\s+/.test(b));

  const assignments = assignBlocks
    .map(parseAssignmentBlock)
    .filter((a): a is AssignmentDraft => Boolean(a));

  return {
    title,
    summary: summary.slice(0, 500),
    content: contentParts.join("\n\n---\n\n").trim() || summary,
    resourceUrl,
    assignments,
  };
}

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function main() {
  const prefix = process.argv[2] || "7-mavzu:";
  const mdPath = resolve(process.cwd(), "kurs_materiallari.md");
  const md = readFileSync(mdPath, "utf8");
  const draft = extractTopic(md, prefix);

  const teacherEmail = process.env.SEED_TEACHER_EMAIL?.trim().toLowerCase();
  const teacher = await prisma.user.findFirst({
    where: teacherEmail
      ? { role: Role.TEACHER, email: teacherEmail }
      : { role: Role.TEACHER },
    orderBy: { createdAt: "asc" },
  });
  if (!teacher) throw new Error("O‘qituvchi topilmadi.");

  let topic = await prisma.topic.findFirst({
    where: { title: draft.title, authorId: teacher.id },
  });

  if (topic) {
    topic = await prisma.topic.update({
      where: { id: topic.id },
      data: {
        summary: draft.summary,
        content: draft.content,
        resourceUrl: draft.resourceUrl,
      },
    });
    console.log(`Updated topic: ${topic.title}`);
  } else {
    topic = await prisma.topic.create({
      data: {
        title: draft.title,
        summary: draft.summary,
        content: draft.content,
        resourceUrl: draft.resourceUrl,
        authorId: teacher.id,
      },
    });
    console.log(`Created topic: ${topic.title}`);
  }

  let created = 0;
  let skipped = 0;
  for (const a of draft.assignments) {
    const existing = await prisma.assignment.findFirst({
      where: { topicId: topic.id, title: a.title },
    });
    if (existing) {
      await prisma.assignment.update({
        where: { id: existing.id },
        data: {
          description: a.description,
          answerKind:
            a.answerKind === "CODE" ? AnswerKind.CODE : AnswerKind.TEXT,
        },
      });
      skipped += 1;
      continue;
    }
    await prisma.assignment.create({
      data: {
        title: a.title,
        description: a.description,
        topicId: topic.id,
        authorId: teacher.id,
        answerKind:
          a.answerKind === "CODE" ? AnswerKind.CODE : AnswerKind.TEXT,
        maxScore: 5,
      },
    });
    created += 1;
    console.log(`+ assignment ${a.title} [${a.answerKind}]`);
  }

  console.log(
    `Done. assignments created=${created} updated/skipped=${skipped}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
