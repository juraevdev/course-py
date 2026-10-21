import Link from "next/link";
import { Suspense } from "react";
import { SearchBox } from "@/components/search";
import { EmptyState, PageIntro, Panel, StatusTag } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { studentContentWhere } from "@/lib/cohorts";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function StudentTopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser(Role.STUDENT);
  if (!user) return null;

  const { q } = await searchParams;
  const query = q?.trim() || "";
  const visible = await studentContentWhere(user.id);

  const topics = await prisma.topic.findMany({
    where: {
      AND: [
        visible,
        query
          ? {
              OR: [
                { title: { contains: query } },
                { summary: { contains: query } },
                { content: { contains: query } },
              ],
            }
          : {},
      ],
    },
    orderBy: { createdAt: "asc" },
    include: { views: { where: { userId: user.id } } },
  });

  return (
    <>
      <PageIntro
        eyebrow="Materiallar"
        title="Mavzular"
        description="Offline dasturlash darsidagi mavzular, eslatmalar va kod resurslari."
        action={
          <Suspense>
            <SearchBox placeholder="Mavzu qidirish..." />
          </Suspense>
        }
      />
      {topics.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {topics.map((topic, index) => (
            <Link key={topic.id} href={`/student/topics/${topic.id}`}>
              <Panel
                index={index}
                className="h-full transition hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-xl font-medium tracking-[-0.02em]">
                    {topic.title}
                  </h2>
                  <StatusTag tone={topic.views.length ? "green" : "blue"}>
                    {topic.views.length ? "Ko‘rilgan" : "Yangi"}
                  </StatusTag>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {topic.summary}
                </p>
                <p className="mt-4 font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                  {formatDate(topic.createdAt)}
                </p>
              </Panel>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title={query ? "Hech narsa topilmadi" : "Mavzular bo‘sh"}
          description={
            query
              ? "Boshqa kalit so‘z bilan qidirib ko‘ring."
              : "O‘qituvchi joylaganda bu yerda paydo bo‘ladi."
          }
        />
      )}
    </>
  );
}
