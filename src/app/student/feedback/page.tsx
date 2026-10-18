import Link from "next/link";
import { EmptyState, PageIntro, Panel, StatusTag } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function StudentFeedbackPage() {
  const user = await requireUser(Role.STUDENT);
  if (!user) return null;

  const items = await prisma.submission.findMany({
    where: {
      studentId: user.id,
      feedback: { not: null },
    },
    orderBy: { updatedAt: "desc" },
    include: { assignment: { include: { topic: true } } },
  });

  return (
    <>
      <PageIntro
        eyebrow="Arxiv"
        title="Izohlar tarixi"
        description="O‘qituvchi bergan barcha feedbacklar shu yerda saqlanadi."
      />
      {items.length ? (
        <div className="space-y-4">
          {items.map((item, index) => (
            <Panel key={item.id} index={index}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  href={`/student/assignments/${item.assignmentId}`}
                  className="font-medium text-[var(--ink)] underline-offset-4 hover:underline"
                >
                  {item.assignment.title}
                </Link>
                <StatusTag tone="green">Ko‘rilgan</StatusTag>
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {item.assignment.topic.title} · {formatDate(item.updatedAt)}
              </p>
              <p className="mt-4 rounded-[8px] bg-[#EDF3EC] px-3 py-2 text-sm text-[#346538]">
                {item.feedback}
              </p>
            </Panel>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Hali izoh yo‘q"
          description="O‘qituvchi topshiriqni ko‘rib chiqqanda bu yerda chiqadi."
        />
      )}
    </>
  );
}
