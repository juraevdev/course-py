import { Panel, StatusTag } from "./ui";
import type { LeaderboardRow } from "@/lib/leaderboard";

export function LeaderboardTable({
  rows,
  currentUserId,
}: {
  rows: LeaderboardRow[];
  currentUserId?: string;
}) {
  if (!rows.length) {
    return (
      <Panel>
        <p className="text-sm text-[var(--muted)]">
          Hali reyting uchun ball yo‘q. Topshiriq topshirib, ball to‘plang.
        </p>
      </Panel>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[12px] border border-[var(--line)] bg-[var(--surface)]">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--line)] text-xs uppercase tracking-[0.06em] text-[var(--muted)]">
            <th className="px-4 py-3 font-medium">#</th>
            <th className="px-4 py-3 font-medium">O‘quvchi</th>
            <th className="px-4 py-3 font-medium">Ball</th>
            <th className="px-4 py-3 font-medium">Baholangan</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const mine = currentUserId === row.studentId;
            return (
              <tr
                key={row.studentId}
                className={`border-b border-[var(--line)] last:border-0 ${
                  mine ? "bg-[color-mix(in_srgb,var(--canvas)_70%,transparent)]" : ""
                }`}
              >
                <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-[var(--muted)]">
                  {row.rank <= 3 ? (
                    <StatusTag
                      tone={
                        row.rank === 1 ? "yellow" : row.rank === 2 ? "blue" : "green"
                      }
                    >
                      {row.rank}
                    </StatusTag>
                  ) : (
                    row.rank
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-[var(--ink)]">
                  {row.name}
                  {mine ? (
                    <span className="ml-2 text-xs text-[var(--muted)]">siz</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 font-[family-name:var(--font-display)] text-lg tracking-[-0.02em] text-[var(--ink)]">
                  {row.totalScore}
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {row.gradedCount}/{row.submittedCount}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
