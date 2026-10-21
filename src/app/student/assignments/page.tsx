import Link from "next/link";
import { Suspense } from "react";
import { SearchBox } from "@/components/search";
import { EmptyState, PageIntro, Panel, StatusTag } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { studentAssignmentWhere } from "@/lib/cohorts";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function StudentAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser(Role.STUDENT);
  if (!user) return null;

  const { q } = await searchParams;
  const query = q?.trim() || "";
  const visible = await studentAssignmentWhere(user.id);

  const assignments = await prisma.assignment.findMany({
    where: {
      AND: [
        visible,
        query
          ? {
              OR: [
                { title: { contains: query } },
                { description: { contains: query } },
                { topic: { title: { contains: query } } },
              ],
            }
          : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      topic: true,
      submissions: { where: { studentId: user.id } },
    },
  });

  return (
    <>
      <PageIntro
        eyebrow="Vazifalar"
        title="Topshiriqlar"
        description="Offline darsdan keyin bajariladigan kod mashqlari."
        action={
          <Suspense>
            <SearchBox placeholder="Topshiriq qidirish..." />
          </Suspense>
        }
      />
      {assignments.length ? (
        <div className="space-y-3">
          {assignments.map((item, index) => {
            const submission = item.submissions[0];
            const soon =
              item.dueAt &&
              item.dueAt.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 &&
              item.dueAt.getTime() >= Date.now() &&
              !submission;

            return (
              <Link key={item.id} href={`/student/assignments/${item.id}`}>
                <Panel index={index} className="mb-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-medium">{item.title}</h2>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {item.topic.title}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {soon ? <StatusTag tone="yellow">Muddat yaqin</StatusTag> : null}
                      {submission?.score != null ? (
                        <StatusTag tone="green">
                          {submission.score}/{item.maxScore}
                        </StatusTag>
                      ) : (
                        <StatusTag
                          tone={
                            submission
                              ? submission.status === "REVIEWED"
                                ? "green"
                                : "blue"
                              : "yellow"
                          }
                        >
                          {submission
                            ? submission.status === "REVIEWED"
                              ? "Ko‘rilgan"
                              : "Yuborilgan"
                            : "Kutilmoqda"}
                        </StatusTag>
                      )}
                    </div>
                  </div>
                  {item.dueAt ? (
                    <p className="mt-3 font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                      Muddat: {formatDate(item.dueAt)}
                    </p>
                  ) : null}
                </Panel>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={query ? "Hech narsa topilmadi" : "Topshiriq yo‘q"}
          description={
            query
              ? "Boshqa so‘z bilan qidirib ko‘ring."
              : "O‘qituvchi yangi topshiriq berganda bu yerda chiqadi."
          }
        />
      )}
    </>
  );
}
