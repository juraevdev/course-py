/**
 * CODE javoblarni joriy avto-testlar bilan qayta baholaydi.
 *   npx tsx scripts/regrade-code-submissions.ts
 */
import { PrismaClient } from "@prisma/client";
import { gradeCodeAgainstTests } from "../src/lib/autograde";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.submission.findMany({
    where: { kind: "CODE" },
    select: {
      id: true,
      content: true,
      assignmentId: true,
      autoScore: true,
      score: true,
      status: true,
      student: { select: { name: true } },
      assignment: { select: { title: true, maxScore: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const graded = await gradeCodeAgainstTests(row.assignmentId, row.content);
    if (!graded) {
      skipped += 1;
      console.log(`SKIP (no tests) ${row.assignment.title} / ${row.student.name}`);
      continue;
    }

    const keepManual =
      row.status === "REVIEWED" &&
      row.score != null &&
      row.score !== row.autoScore;

    await prisma.submission.update({
      where: { id: row.id },
      data: {
        autoScore: graded.autoScore,
        testsPassed: graded.testsPassed,
        testsTotal: graded.testsTotal,
        testReport: graded.reportJson,
        // O‘qituvchi qo‘lda boshqa ball qo‘ygan bo‘lsa — score ni saqlaymiz
        score: keepManual ? row.score : graded.autoScore,
      },
    });

    updated += 1;
    console.log(
      `OK ${row.assignment.title} / ${row.student.name}: auto ${row.autoScore} → ${graded.autoScore}` +
        (keepManual ? ` (manual score ${row.score} saqlandi)` : ""),
    );
  }

  console.log(`Done. updated=${updated} skipped=${skipped}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
