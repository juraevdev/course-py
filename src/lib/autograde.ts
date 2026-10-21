import { prisma } from "./prisma";
import { normalizeStdout, runPythonCode } from "./runner";

export type TestCaseResult = {
  id: string;
  name: string;
  passed: boolean;
  points: number;
  earned: number;
  isHidden: boolean;
  stdout?: string;
  stderr?: string;
  expected?: string;
  error?: string | null;
};

export type AutogradeResult = {
  autoScore: number;
  testsPassed: number;
  testsTotal: number;
  report: TestCaseResult[];
  reportJson: string;
};

export async function gradeCodeAgainstTests(
  assignmentId: string,
  code: string,
): Promise<AutogradeResult | null> {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      tests: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    },
  });

  if (!assignment || assignment.tests.length === 0) return null;

  const totalPoints = assignment.tests.reduce((sum, t) => sum + t.points, 0);
  const report: TestCaseResult[] = [];
  let earnedPoints = 0;
  let testsPassed = 0;

  for (const test of assignment.tests) {
    const result = await runPythonCode(code, test.stdin);
    const actual = normalizeStdout(result.stdout);
    const expected = normalizeStdout(test.expectedStdout);
    const passed =
      result.ok &&
      !result.timed_out &&
      !result.error &&
      actual === expected;

    if (passed) {
      testsPassed += 1;
      earnedPoints += test.points;
    }

    report.push({
      id: test.id,
      name: test.name,
      passed,
      points: test.points,
      earned: passed ? test.points : 0,
      isHidden: test.isHidden,
      stdout: test.isHidden ? undefined : actual,
      stderr: test.isHidden
        ? undefined
        : result.stderr || result.error || undefined,
      expected: test.isHidden ? undefined : expected,
      error: result.error,
    });
  }

  const autoScore =
    totalPoints > 0
      ? Math.round((earnedPoints / totalPoints) * assignment.maxScore)
      : 0;

  return {
    autoScore,
    testsPassed,
    testsTotal: assignment.tests.length,
    report,
    reportJson: JSON.stringify(report),
  };
}

export function parseTestReport(raw: string | null | undefined): TestCaseResult[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as TestCaseResult[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** O‘quvchiga yashirin test tafsilotlarini yashirish. */
export function publicTestReport(report: TestCaseResult[]): TestCaseResult[] {
  return report.map((item) =>
    item.isHidden
      ? {
          id: item.id,
          name: item.name,
          passed: item.passed,
          points: item.points,
          earned: item.earned,
          isHidden: true,
        }
      : item,
  );
}
