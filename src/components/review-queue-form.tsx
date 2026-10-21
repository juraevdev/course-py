"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { reviewSubmissionAction, type ActionState } from "@/lib/actions";
import { Button, Field } from "./ui";

const initial: ActionState = {};

export function ReviewQueueForm({
  submissionId,
  maxScore,
  defaultScore,
  defaultFeedback,
  nextHref,
}: {
  submissionId: string;
  maxScore: number;
  defaultScore?: number | null;
  defaultFeedback?: string | null;
  nextHref: string | null;
}) {
  const [state, action, pending] = useActionState(
    reviewSubmissionAction,
    initial,
  );

  const showNext = Boolean(state.success && nextHref);

  return (
    <div className="space-y-5">
      <form action={action} className="space-y-4">
        <input type="hidden" name="submissionId" value={submissionId} />
        <Field
          label={`Ball (0–${maxScore})`}
          name="score"
          type="number"
          required
          defaultValue={String(defaultScore ?? "")}
        />
        <Field
          label="Izoh"
          name="feedback"
          as="textarea"
          rows={3}
          required
          defaultValue={defaultFeedback ?? ""}
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
          {pending ? "Saqlanmoqda..." : "Baholash"}
        </Button>
      </form>

      {showNext && nextHref ? (
        <Link
          href={nextHref}
          className="inline-flex w-full items-center justify-center gap-2 rounded-[6px] bg-[var(--btn-bg)] px-4 py-3 text-sm font-medium text-[var(--btn-fg)] transition hover:bg-[var(--btn-hover)]"
        >
          Keyingisi
          <ArrowRight weight="bold" size={18} />
        </Link>
      ) : null}

      {!showNext && nextHref ? (
        <Link
          href={nextHref}
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] underline-offset-4 hover:underline"
        >
          Keyingi javobga o‘tish
          <ArrowRight weight="bold" size={16} />
        </Link>
      ) : null}

      {state.success && !nextHref ? (
        <Link
          href="/teacher/submissions"
          className="inline-flex w-full items-center justify-center gap-2 rounded-[6px] border border-[var(--line)] bg-[var(--btn-secondary-bg)] px-4 py-3 text-sm font-medium"
        >
          Barcha javoblar ro‘yxati
        </Link>
      ) : null}
    </div>
  );
}
