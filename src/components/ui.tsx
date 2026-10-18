import { ReactNode } from "react";

export function Shell({
  brand,
  nav,
  children,
}: {
  brand: string;
  nav: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <div className="ambient" aria-hidden />
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--canvas)_86%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="font-[family-name:var(--font-display)] text-xl tracking-[-0.03em] text-[var(--ink)]">
              {brand}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">{nav}</div>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12 md:py-16">
        {children}
      </main>
    </div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="reveal mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-[family-name:var(--font-display)] text-4xl leading-[1.1] tracking-[-0.03em] text-[var(--ink)] md:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Panel({
  children,
  className = "",
  index = 0,
}: {
  children: ReactNode;
  className?: string;
  index?: number;
}) {
  return (
    <section
      className={`reveal rounded-[12px] border border-[var(--line)] bg-[var(--surface)] p-6 md:p-8 ${className}`}
      style={{ ["--index" as string]: index }}
    >
      {children}
    </section>
  );
}

export function StatusTag({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "blue" | "green" | "yellow" | "red";
  children: ReactNode;
}) {
  const tones = {
    neutral: "bg-[#F7F6F3] text-[var(--muted)]",
    blue: "bg-[#E1F3FE] text-[#1F6C9F]",
    green: "bg-[#EDF3EC] text-[#346538]",
    yellow: "bg-[#FBF3DB] text-[#956400]",
    red: "bg-[#FDEBEC] text-[#9F2F2D]",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.05em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "secondary";
}) {
  const variants = {
    primary:
      "bg-[var(--btn-bg)] text-[var(--btn-fg)] hover:bg-[var(--btn-hover)] active:scale-[0.98]",
    secondary:
      "border border-[var(--line)] bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-fg)] hover:bg-[var(--btn-secondary-hover)] active:scale-[0.98]",
    ghost:
      "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--canvas)] active:scale-[0.98]",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[6px] px-4 py-2.5 text-sm font-medium transition duration-200 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  defaultValue,
  as = "input",
  rows = 5,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  as?: "input" | "textarea";
  rows?: number;
}) {
  const shared =
    "mt-2 w-full rounded-[6px] border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[#A8A29E] focus:border-[#C9C9C9]";

  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--ink)]">{label}</span>
      {as === "textarea" ? (
        <textarea
          name={name}
          rows={rows}
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
          className={`${shared} resize-y leading-relaxed`}
        />
      ) : (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
          className={shared}
        />
      )}
    </label>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[12px] border border-dashed border-[var(--line)] bg-[var(--surface)] px-6 py-12 text-center">
      <h3 className="text-lg font-medium text-[var(--ink)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--muted)]">
        {description}
      </p>
    </div>
  );
}
