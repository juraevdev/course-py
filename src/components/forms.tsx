"use client";

import { useActionState } from "react";
import {
  createAssignmentAction,
  createTopicAction,
  reviewSubmissionAction,
  submitAssignmentAction,
  type ActionState,
} from "@/lib/actions";
import { Button, Field } from "./ui";

const initial: ActionState = {};

export function CreateTopicForm() {
  const [state, action, pending] = useActionState(createTopicAction, initial);

  return (
    <form action={action} className="space-y-5">
      <Field
        label="Mavzu nomi"
        name="title"
        required
        placeholder="Masalan: Funksiyalar"
      />
      <Field
        label="Qisqa izoh"
        name="summary"
        required
        placeholder="O‘quvchi ro‘yxatda ko‘radigan qisqa matn"
      />
      <Field
        label="Mavzu matni"
        name="content"
        as="textarea"
        rows={8}
        required
        placeholder="Kod misollari, eslatmalar, offline darsga bog‘liq material"
      />
      <Field
        label="Resurs URL (hujjat, gist, repo…)"
        name="resourceUrl"
        type="url"
        placeholder="https://..."
      />
      {state.error ? (
        <p className="rounded-[6px] bg-[#FDEBEC] px-3 py-2 text-sm text-[#9F2F2D]">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saqlanmoqda..." : "Mavzuni joylash"}
      </Button>
    </form>
  );
}

export function CreateAssignmentForm({
  topics,
  defaultTopicId,
}: {
  topics: { id: string; title: string }[];
  defaultTopicId?: string;
}) {
  const [state, action, pending] = useActionState(
    createAssignmentAction,
    initial,
  );

  return (
    <form action={action} className="space-y-5">
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
      <Field label="Topshiriq nomi" name="title" required />
      <Field
        label="Tavsif"
        name="description"
        as="textarea"
        rows={6}
        required
      />
      <Field label="Muddat (ixtiyoriy)" name="dueAt" type="date" />
      {state.error ? (
        <p className="rounded-[6px] bg-[#FDEBEC] px-3 py-2 text-sm text-[#9F2F2D]">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Yuborilmoqda..." : "Topshiriqni berish"}
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

export function ReviewForm({ submissionId }: { submissionId: string }) {
  const [state, action, pending] = useActionState(
    reviewSubmissionAction,
    initial,
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="submissionId" value={submissionId} />
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
        {pending ? "..." : "Ko‘rib chiqildi deb belgilash"}
      </Button>
    </form>
  );
}
