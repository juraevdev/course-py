"use client";

import { useActionState } from "react";
import {
  answerTopicQuestionAction,
  askTopicQuestionAction,
  saveNoteAction,
  type ActionState,
} from "@/lib/actions";
import { Button, Field } from "./ui";

const initial: ActionState = {};

export function AskQuestionForm({ topicId }: { topicId: string }) {
  const [state, action, pending] = useActionState(
    askTopicQuestionAction,
    initial,
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="topicId" value={topicId} />
      <Field
        label="O‘qituvchiga savol"
        name="body"
        as="textarea"
        rows={3}
        required
        placeholder="Tushunmagan joyingizni qisqa yozing"
      />
      {state.error ? (
        <p className="rounded-[6px] bg-[#FDEBEC] px-3 py-2 text-sm text-[#9F2F2D]">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-[6px] bg-[#EDF3EC] px-3 py-2 text-sm text-[#346538]">
          {state.success}
        </p>
      ) : null}
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "..." : "Savol yuborish"}
      </Button>
    </form>
  );
}

export function AnswerQuestionForm({ questionId }: { questionId: string }) {
  const [state, action, pending] = useActionState(
    answerTopicQuestionAction,
    initial,
  );

  return (
    <form action={action} className="mt-3 space-y-3">
      <input type="hidden" name="questionId" value={questionId} />
      <Field label="Javob" name="answer" as="textarea" rows={2} required />
      {state.error ? (
        <p className="text-sm text-[#9F2F2D]">{state.error}</p>
      ) : null}
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "..." : "Javob berish"}
      </Button>
    </form>
  );
}

export function NoteForm({
  topics,
  defaultTopicId,
}: {
  topics: { id: string; title: string }[];
  defaultTopicId?: string;
}) {
  const [state, action, pending] = useActionState(saveNoteAction, initial);

  return (
    <form action={action} className="space-y-4">
      <Field label="Sarlavha" name="title" required placeholder="Masalan: loop eslatmasi" />
      <Field label="Matn" name="body" as="textarea" rows={5} required />
      <label className="block">
        <span className="text-sm font-medium text-[var(--ink)]">
          Mavzu (ixtiyoriy)
        </span>
        <select
          name="topicId"
          defaultValue={defaultTopicId || ""}
          className="mt-2 w-full rounded-[6px] border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-sm outline-none"
        >
          <option value="">Umumiy</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </label>
      {state.error ? (
        <p className="rounded-[6px] bg-[#FDEBEC] px-3 py-2 text-sm text-[#9F2F2D]">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-[6px] bg-[#EDF3EC] px-3 py-2 text-sm text-[#346538]">
          {state.success}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "..." : "Saqlash"}
      </Button>
    </form>
  );
}

