"use client";

import { useActionState } from "react";
import {
  createStudentAction,
  resetStudentPasswordAction,
  type ActionState,
} from "@/lib/actions";
import { Button, Field } from "./ui";

const initial: ActionState = {};

export function CreateStudentForm() {
  const [state, action, pending] = useActionState(createStudentAction, initial);

  return (
    <form action={action} className="space-y-4">
      <Field label="Ism" name="name" required placeholder="Dilnoza Rahimova" />
      <Field
        label="Email"
        name="email"
        type="email"
        required
        placeholder="dilnoza@kurs.uz"
      />
      <Field
        label="Vaqtinchalik parol"
        name="password"
        type="text"
        required
        placeholder="kamida 6 belgi"
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
        {pending ? "..." : "O‘quvchi qo‘shish"}
      </Button>
    </form>
  );
}

export function ResetPasswordForm({ studentId }: { studentId: string }) {
  const [state, action, pending] = useActionState(
    resetStudentPasswordAction,
    initial,
  );

  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="studentId" value={studentId} />
      <label className="min-w-[160px] flex-1">
        <span className="sr-only">Yangi parol</span>
        <input
          name="password"
          type="text"
          required
          minLength={6}
          placeholder="Yangi parol"
          className="w-full rounded-[6px] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm outline-none"
        />
      </label>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "..." : "Parol"}
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
