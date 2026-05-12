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
          <p className="mb-1 text-sm font-semibold uppercase tracking-[0.14em] text-gather-teal/80">
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
  /** `accountShell`: larger teal headings above parchment cards (profile settings) */
  /** `hostShell`: teal section labels optimized for espresso / candlelit host views */
  variant?: "default" | "onDark" | "accountShell" | "hostShell";
}) {
  let labelClass: string;
  if (variant === "onDark") {
    labelClass = "text-gather-cream/80";
  } else if (variant === "accountShell") {
    labelClass =
      "font-serif text-[15px] tracking-[0.1em] text-gather-accent sm:text-[15.5px] sm:tracking-[0.095em]";
  } else if (variant === "hostShell") {
    labelClass =
      "text-[15px] font-semibold tracking-[0.1em] text-[#74c5db] drop-shadow-[0_1px_14px_rgb(116_197_219_/_0.14)] sm:text-[15.5px]";
  } else {
    labelClass = "text-gather-teal";
  }

  const barClass =
    variant === "accountShell"
      ? "h-1.5 w-6 rounded-full bg-gather-accent/80"
      : variant === "hostShell"
        ? "h-1.5 w-6 rounded-full bg-[#74c5db]/90"
        : "h-1.5 w-5 rounded-full bg-gather-teal/80";

  const headingClass =
    variant === "accountShell"
      ? `flex items-center gap-2.5 font-semibold uppercase ${labelClass}`
      : variant === "hostShell"
        ? `flex items-center gap-2.5 font-sans font-semibold uppercase ${labelClass}`
        : `flex items-center gap-2.5 text-base font-semibold uppercase tracking-[0.08em] sm:text-[17px] sm:tracking-[0.07em] ${labelClass}`;

  return (
    <div className={`mb-4 flex items-center justify-between gap-3 ${className}`}>
      <h2 className={headingClass}>
        <span className={barClass} aria-hidden />
        {title}
      </h2>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
