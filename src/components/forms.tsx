"use client";

import { useActionState } from "react";
import {
  createAssignmentAction,
  createTopicAction,
  deleteAssignmentAction,
  deleteTopicAction,
  reviewSubmissionAction,
  submitAssignmentAction,
  updateAssignmentAction,
  updateTopicAction,
  type ActionState,
} from "@/lib/actions";
import { Button, Field } from "./ui";

const initial: ActionState = {};

export function CreateTopicForm({
  defaults,
  topicId,
  cohorts = [],
}: {
  defaults?: {
    title: string;
    summary: string;
    content: string;
    resourceUrl?: string | null;
    cohortId?: string | null;
  };
  topicId?: string;
  cohorts?: { id: string; name: string }[];
}) {
  const editing = Boolean(topicId);
  const [state, action, pending] = useActionState(
    editing ? updateTopicAction : createTopicAction,
    initial,
  );

  return (
    <form action={action} className="space-y-5">
      {topicId ? <input type="hidden" name="topicId" value={topicId} /> : null}
      <Field
        label="Mavzu nomi"
        name="title"
        required
        defaultValue={defaults?.title}
        placeholder="Masalan: Funksiyalar"
      />
      <Field
        label="Qisqa izoh"
        name="summary"
        required
        defaultValue={defaults?.summary}
        placeholder="O‘quvchi ro‘yxatda ko‘radigan qisqa matn"
      />
      <Field
        label="Mavzu matni"
        name="content"
        as="textarea"
        rows={8}
        required
        defaultValue={defaults?.content}
        placeholder="Kod misollari, eslatmalar, offline darsga bog‘liq material"
      />
      <Field
        label="Resurs URL (hujjat, gist, repo…)"
        name="resourceUrl"
        type="url"
        defaultValue={defaults?.resourceUrl ?? ""}
        placeholder="https://..."
      />
      <label className="block">
        <span className="text-sm font-medium text-[var(--ink)]">Guruh</span>
        <select
          name="cohortId"
          defaultValue={defaults?.cohortId ?? ""}
          className="mt-2 w-full rounded-[6px] border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none"
        >
          <option value="">Barcha o‘quvchilar</option>
          {cohorts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      {state.error ? (
        <p className="rounded-[6px] bg-[#FDEBEC] px-3 py-2 text-sm text-[#9F2F2D]">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saqlanmoqda..." : editing ? "O‘zgarishlarni saqlash" : "Mavzuni joylash"}
      </Button>
    </form>
  );
}

export function DeleteTopicForm({ topicId }: { topicId: string }) {
  return (
    <form
      action={deleteTopicAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            "Mavzu va unga bog‘liq topshiriqlar o‘chiriladi. Davom etasizmi?",
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="topicId" value={topicId} />
      <Button type="submit" variant="secondary" className="!text-[#9F2F2D]">
        Mavzuni o‘chirish
      </Button>
    </form>
  );
}

export function CreateAssignmentForm({
  topics,
  defaultTopicId,
  assignmentId,
  cohorts = [],
  defaults,
}: {
  topics: { id: string; title: string }[];
  defaultTopicId?: string;
  assignmentId?: string;
  cohorts?: { id: string; name: string }[];
  defaults?: {
    title: string;
    description: string;
    dueAt?: string;
    cohortId?: string | null;
    maxScore?: number;
  };
}) {
  const editing = Boolean(assignmentId);
  const [state, action, pending] = useActionState(
    editing ? updateAssignmentAction : createAssignmentAction,
    initial,
  );

  return (
    <form action={action} className="space-y-5">
      {assignmentId ? (
        <input type="hidden" name="assignmentId" value={assignmentId} />
      ) : null}
      <label className="block">
        <span className="text-sm font-medium text-[var(--ink)]">Mavzu</span>
        <select
          name="topicId"
          required
          defaultValue={defaultTopicId}
          className="mt-2 w-full rounded-[6px] border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none"
        >
          <option value="">Tanlang</option>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.title}
            </option>
          ))}
        </select>
      </label>
      <Field
        label="Topshiriq nomi"
        name="title"
        required
        defaultValue={defaults?.title}
      />
      <Field
        label="Tavsif"
        name="description"
        as="textarea"
        rows={6}
        required
        defaultValue={defaults?.description}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Maksimal ball"
          name="maxScore"
          type="number"
          required
          defaultValue={String(defaults?.maxScore ?? 100)}
        />
        <Field
          label="Muddat (ixtiyoriy)"
          name="dueAt"
          type="date"
          defaultValue={defaults?.dueAt}
        />
      </div>
      <label className="block">
        <span className="text-sm font-medium text-[var(--ink)]">Guruh</span>
        <select
          name="cohortId"
          defaultValue={defaults?.cohortId ?? ""}
          className="mt-2 w-full rounded-[6px] border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none"
        >
          <option value="">Mavzu guruhidan / barcha</option>
          {cohorts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      {state.error ? (
        <p className="rounded-[6px] bg-[#FDEBEC] px-3 py-2 text-sm text-[#9F2F2D]">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending
          ? "Saqlanmoqda..."
          : editing
            ? "O‘zgarishlarni saqlash"
            : "Topshiriqni berish"}
      </Button>
    </form>
  );
}

export function DeleteAssignmentForm({ assignmentId }: { assignmentId: string }) {
  return (
    <form
      action={deleteAssignmentAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            "Topshiriq va o‘quvchi javoblari o‘chiriladi. Davom etasizmi?",
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <Button type="submit" variant="secondary" className="!text-[#9F2F2D]">
        Topshiriqni o‘chirish
      </Button>
    </form>
  );
}

export function SubmitAssignmentForm({
  assignmentId,
  defaultValue,
}: {
  assignmentId: string;
  defaultValue?: string;
}) {
  const [state, action, pending] = useActionState(
    submitAssignmentAction,
    initial,
  );

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <Field
        label="Javobingiz"
        name="content"
        as="textarea"
        rows={7}
        required
        defaultValue={defaultValue}
        placeholder="Kodni shu yerga joylang yoki GitHub/Gist havolasini yozing."
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
      <Button type="submit" disabled={pending}>
        {pending ? "Saqlanmoqda..." : "Javobni yuborish"}
      </Button>
    </form>
  );
}

export function ReviewForm({
  submissionId,
  maxScore,
  defaultScore,
}: {
  submissionId: string;
  maxScore: number;
  defaultScore?: number | null;
}) {
  const [state, action, pending] = useActionState(
    reviewSubmissionAction,
    initial,
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="submissionId" value={submissionId} />
      <Field
        label={`Ball (0–${maxScore})`}
        name="score"
        type="number"
        required
        defaultValue={String(defaultScore ?? "")}
      />
      <Field label="Izoh" name="feedback" as="textarea" rows={3} required />
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
        {pending ? "..." : "Baholash"}
      </Button>
    </form>
  );
}
