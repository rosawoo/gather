export function PageHeader({
  title,
  subtitle,
  eyebrow,
  action,
  className = "",
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-8 flex items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-gather-teal/80">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-2xl font-light tracking-tight text-gather-ink sm:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-gather-charcoal">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function SectionTitle({
  title,
  action,
  className = "",
  variant = "default",
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
  /** `onDark`: cream typography for espresso / mood-board backgrounds */
  variant?: "default" | "onDark";
}) {
  const labelClass =
    variant === "onDark"
      ? "text-gather-cream/80"
      : "text-gather-teal";
  return (
    <div className={`mb-4 flex items-center justify-between gap-3 ${className}`}>
      <h2
        className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] ${labelClass}`}
      >
        <span
          className="h-1 w-4 rounded-full bg-gather-teal/80"
          aria-hidden
        />
        {title}
      </h2>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
