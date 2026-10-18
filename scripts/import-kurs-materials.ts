import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

type AssignmentDraft = {
  title: string;
  description: string;
};

type TopicDraft = {
  title: string;
  summary: string;
  content: string;
  resourceUrl: string | null;
  assignments: AssignmentDraft[];
};

function firstUrl(text: string): string | null {
  const m = text.match(/https?:\/\/[^\s)\]]+/);
  return m ? m[0] : null;
}

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

  return { title, description: lines.join("\n") };
}

function sectionBody(chunk: string, heading: string): string {
  const re = new RegExp(
    `##\\s+${heading}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|\\n###\\s+|$)`,
  );
  return chunk.match(re)?.[1].trim() || "";
}

function parseTopics(md: string): TopicDraft[] {
  const start = md.search(/^# \d+-mavzu:/m);
  const body = start >= 0 ? md.slice(start) : md;
  const chunks = body.split(/\n(?=# (?:\d+-mavzu:|Qo'shimcha:))/);

  const topics: TopicDraft[] = [];

  for (const chunk of chunks) {
    if (!chunk.trim()) continue;

    const titleMatch = chunk.match(/^#\s+(.+)$/m);
    if (!titleMatch) continue;

    let title = titleMatch[1].trim().replace(/^Qo'shimcha:\s*/i, "");

    const summaryMatch = chunk.match(
      /##\s+Qisqacha mazmun\s*\n([\s\S]*?)(?=\n##\s+)/,
    );
    let summary = summaryMatch?.[1].trim() || "";
    if (!summary) {
      const intro = chunk
        .replace(/^#.*$/m, "")
        .replace(/`slug:[^`]+`/, "")
        .split(/\n###\s+/)[0]
        .trim();
      summary = intro.split(/\n\n/)[0]?.trim() || title;
    }

    const contentParts: string[] = [];
    const tushuntirish = sectionBody(chunk, "Qo'shimcha tushuntirish");
    if (tushuntirish) {
      contentParts.push(`Qo'shimcha tushuntirish\n\n${tushuntirish}`);
    } else if (!summaryMatch) {
      const intro = chunk
        .replace(/^#.*$/m, "")
        .replace(/`slug:[^`]+`/, "")
        .split(/\n###\s+/)[0]
        .trim();
      if (intro) contentParts.push(intro);
    }

    for (const h of [
      "Asosiy tushunchalar",
      "Kod namunalari",
      "Tez-tez uchraydigan xato tushunchalar",
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

    topics.push({
      title,
      summary: summary.slice(0, 500),
      content: contentParts.join("\n\n---\n\n").trim() || summary,
      resourceUrl,
      assignments,
    });
  }

  return topics;
}

async function main() {
  const mdPath = resolve(process.cwd(), "kurs_materiallari.md");
  const md = readFileSync(mdPath, "utf8");
  const topics = parseTopics(md);

  if (!topics.length) throw new Error("Mavzular topilmadi.");

  const teacherEmail = process.env.SEED_TEACHER_EMAIL?.trim().toLowerCase();
  const teacher = await prisma.user.findFirst({
    where: teacherEmail
      ? { role: Role.TEACHER, email: teacherEmail }
      : { role: Role.TEACHER },
    orderBy: { createdAt: "asc" },
  });
  if (!teacher) {
    throw new Error("O‘qituvchi topilmadi. Avval db:seed qiling.");
  }

  await prisma.notification.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.topicQuestion.deleteMany();
  await prisma.studentNote.deleteMany();
  await prisma.topicView.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.topic.deleteMany();

  let assignmentCount = 0;
  for (const t of topics) {
    const topic = await prisma.topic.create({
      data: {
        title: t.title,
        summary: t.summary,
        content: t.content,
        resourceUrl: t.resourceUrl,
        authorId: teacher.id,
      },
    });

    for (const a of t.assignments) {
      await prisma.assignment.create({
        data: {
          title: a.title,
          description: a.description,
          topicId: topic.id,
          authorId: teacher.id,
        },
      });
      assignmentCount += 1;
    }

    console.log(`+ ${t.title} (${t.assignments.length} topshiriq)`);
  }

  console.log(`Tayyor: ${topics.length} mavzu, ${assignmentCount} topshiriq.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
