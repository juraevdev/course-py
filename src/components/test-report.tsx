import { StatusTag } from "./ui";
import type { TestCaseResult } from "@/lib/autograde";

export function TestReportList({
  report,
  maxScore,
  score,
}: {
  report: TestCaseResult[];
  maxScore: number;
  score?: number | null;
}) {
  if (!report.length) return null;

  const passed = report.filter((t) => t.passed).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <StatusTag tone={passed === report.length ? "green" : "yellow"}>
          {passed}/{report.length} test
        </StatusTag>
        {score != null ? (
          <StatusTag tone="blue">
            {score}/{maxScore} ball
          </StatusTag>
        ) : null}
      </div>
      <ul className="space-y-2">
        {report.map((test) => (
          <li
            key={test.id}
            className="rounded-[8px] border border-[var(--line)] px-3 py-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-[var(--ink)]">{test.name}</p>
              <StatusTag tone={test.passed ? "green" : "red"}>
                {test.passed ? "O‘tdi" : "Yiqildi"} · {test.earned}/{test.points}
              </StatusTag>
            </div>
            {!test.isHidden && !test.passed ? (
              <div className="mt-2 space-y-1 font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                {test.expected != null ? (
                  <p>Kutilgan: {JSON.stringify(test.expected)}</p>
                ) : null}
                {test.stdout != null ? (
                  <p>Chiqish: {JSON.stringify(test.stdout)}</p>
                ) : null}
                {test.stderr ? <p className="text-[#9F2F2D]">{test.stderr}</p> : null}
              </div>
            ) : null}
            {test.isHidden ? (
              <p className="mt-1 text-xs text-[var(--muted)]">Yashirin test</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
