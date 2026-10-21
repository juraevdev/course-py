"use client";

import { useActionState } from "react";
import {
  addCohortMemberAction,
  createAssignmentTestAction,
  createCohortAction,
  deleteAssignmentTestAction,
  deleteCohortAction,
  removeCohortMemberAction,
  updateCohortAction,
} from "@/lib/competition-actions";
import { Button, Field } from "./ui";

type ActionState = { error?: string; success?: string };
const initial: ActionState = {};

export function CreateCohortForm() {
  const [state, action, pending] = useActionState(createCohortAction, initial);

  return (
    <form action={action} className="space-y-4">
      <Field label="Guruh nomi" name="name" required placeholder="A-guruh" />
      <Field
        label="Izoh (ixtiyoriy)"
        name="description"
        as="textarea"
        rows={3}
        placeholder="Dushanba 18:00, boshlang‘ich"
      />
      {state.error ? (
        <p className="rounded-[6px] bg-[#FDEBEC] px-3 py-2 text-sm text-[#9F2F2D]">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "..." : "Guruh yaratish"}
      </Button>
    </form>
  );
}

export function UpdateCohortForm({
  cohortId,
  name,
  description,
}: {
  cohortId: string;
  name: string;
  description?: string | null;
}) {
  const [state, action, pending] = useActionState(updateCohortAction, initial);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="cohortId" value={cohortId} />
      <Field label="Guruh nomi" name="name" required defaultValue={name} />
      <Field
        label="Izoh"
        name="description"
        as="textarea"
        rows={3}
        defaultValue={description ?? ""}
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
        {pending ? "..." : "Saqlash"}
      </Button>
    </form>
  );
}

export function DeleteCohortForm({ cohortId }: { cohortId: string }) {
  return (
    <form
      action={deleteCohortAction}
      onSubmit={(event) => {
        if (!window.confirm("Guruh o‘chiriladi. Davom etasizmi?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="cohortId" value={cohortId} />
      <Button type="submit" variant="secondary" className="!text-[#9F2F2D]">
        Guruhni o‘chirish
      </Button>
    </form>
  );
}

export function AddCohortMemberForm({
  cohortId,
  students,
}: {
  cohortId: string;
  students: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(addCohortMemberAction, initial);

  if (!students.length) {
    return (
      <p className="text-sm text-[var(--muted)]">
        Qo‘shish uchun bo‘sh o‘quvchi qolmadi.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="cohortId" value={cohortId} />
      <label className="min-w-[180px] flex-1">
        <span className="text-sm font-medium text-[var(--ink)]">O‘quvchi</span>
        <select
          name="studentId"
          required
          className="mt-2 w-full rounded-[6px] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm outline-none"
        >
          <option value="">Tanlang</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "..." : "Qo‘shish"}
      </Button>
      {state.error ? (
        <p className="w-full text-xs text-[#9F2F2D]">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="w-full text-xs text-[#346538]">{state.success}</p>
      ) : null}
    </form>
  );
}

export function RemoveCohortMemberForm({
  cohortId,
  studentId,
}: {
  cohortId: string;
  studentId: string;
}) {
  return (
    <form action={removeCohortMemberAction}>
      <input type="hidden" name="cohortId" value={cohortId} />
      <input type="hidden" name="studentId" value={studentId} />
      <Button type="submit" variant="ghost" className="!px-2 !py-1 text-xs">
        Chiqarish
      </Button>
    </form>
  );
}

export function CreateAssignmentTestForm({
  assignmentId,
}: {
  assignmentId: string;
}) {
  const [state, action, pending] = useActionState(
    createAssignmentTestAction,
    initial,
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <Field label="Test nomi" name="name" required placeholder="1-test" />
      <Field
        label="stdin"
        name="stdin"
        as="textarea"
        rows={2}
        placeholder="Kirish (bo‘sh bo‘lishi mumkin)"
      />
      <Field
        label="Kutilgan stdout"
        name="expectedStdout"
        as="textarea"
        rows={3}
        required
        placeholder="Chop etilishi kerak bo‘lgan natija"
      />
      <Field label="Ball" name="points" type="number" defaultValue="1" required />
      <label className="flex items-center gap-2 text-sm text-[var(--body)]">
        <input type="checkbox" name="isHidden" value="false" />
        O‘quvchiga stdin/stdout ko‘rinsin
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
        {pending ? "..." : "Test qo‘shish"}
      </Button>
    </form>
  );
}

export function DeleteAssignmentTestForm({ testId }: { testId: string }) {
  return (
    <form action={deleteAssignmentTestAction}>
      <input type="hidden" name="testId" value={testId} />
      <Button type="submit" variant="ghost" className="!px-2 !py-1 text-xs !text-[#9F2F2D]">
        O‘chirish
      </Button>
    </form>
  );
}
