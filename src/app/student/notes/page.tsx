import { NoteForm } from "@/components/student-forms";
import { Button, EmptyState, PageIntro, Panel } from "@/components/ui";
import { deleteNoteAction } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function StudentNotesPage({
  searchParams,
}: {
  searchParams: Promise<{ topicId?: string }>;
}) {
  const user = await requireUser(Role.STUDENT);
  if (!user) return null;

  const { topicId } = await searchParams;

  const [notes, topics] = await Promise.all([
    prisma.studentNote.findMany({
      where: { studentId: user.id },
      orderBy: { updatedAt: "desc" },
      include: { topic: true },
    }),
    prisma.topic.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  return (
    <>
      <PageIntro
        eyebrow="Shaxsiy"
        title="Eslatmalar"
        description="Offline darsdan o‘zingiz uchun qisqa yozuvlar. Faqat siz ko‘rasiz."
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-4 text-lg font-medium">Yangi eslatma</h2>
          <NoteForm topics={topics} defaultTopicId={topicId} />
        </Panel>

        <div className="space-y-3">
          {notes.length ? (
            notes.map((note, index) => (
              <Panel key={note.id} index={index} className="!p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-[var(--ink)]">{note.title}</h3>
                    {note.topic ? (
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {note.topic.title}
                      </p>
                    ) : null}
                  </div>
                  <form action={deleteNoteAction}>
                    <input type="hidden" name="noteId" value={note.id} />
                    <Button type="submit" variant="ghost">
                      O‘chirish
                    </Button>
                  </form>
                </div>
                <p className="prose-kurs mt-3 text-sm">{note.body}</p>
                <p className="mt-3 font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                  {formatDate(note.updatedAt)}
                </p>
              </Panel>
            ))
          ) : (
            <EmptyState
              title="Eslatma yo‘q"
              description="Darsdagi muhim narsalarni shu yerda saqlang."
            />
          )}
        </div>
      </div>
    </>
  );
}
