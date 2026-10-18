"use client";

import { useActionState } from "react";
import { loginAction, type ActionState } from "@/lib/auth-actions";
import { Button, Field } from "./ui";

const initial: ActionState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="space-y-5">
      <Field
        label="Email"
        name="email"
        type="email"
        placeholder="email@example.com"
        required
      />
      <Field
        label="Parol"
        name="password"
        type="password"
        placeholder="••••••••"
        required
      />
      {state.error ? (
        <p className="rounded-[6px] bg-[#FDEBEC] px-3 py-2 text-sm text-[#9F2F2D]">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Kirilmoqda..." : "Hisobga kirish"}
      </Button>
    </form>
  );
}
