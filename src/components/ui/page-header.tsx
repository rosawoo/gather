export function PageHeader({
  title,
  subtitle,
  eyebrow,
  action,
  className = "",
  variant = "default",
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  className?: string;
  /** `espresso`: light cream title + muted subtitle on dark candlelit shell */
  variant?: "default" | "espresso";
}) {
  const isEspresso = variant === "espresso";

  return (
    <div className={`mb-8 flex items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        {eyebrow ? (
          <p
            className={
              isEspresso
                ? "mb-1 text-sm font-semibold uppercase tracking-[0.14em] text-lc-tan-accent"
                : "mb-1 text-sm font-semibold uppercase tracking-[0.14em] text-gather-accent/80"
            }
          >
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={
            isEspresso
              ? "font-serif text-[1.875rem] font-semibold leading-tight tracking-tight text-lc-cream sm:text-[2rem]"
              : "font-display text-2xl font-light tracking-tight text-gather-ink sm:text-3xl"
          }
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            className={
              isEspresso
                ? "mt-2 max-w-xl text-[15px] leading-relaxed text-lc-cream/72 sm:text-[15.5px]"
                : "mt-1 text-sm text-gather-charcoal"
            }
          >
            {subtitle}
          </p>
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
  /** `hostShell`: warm section labels for espresso / candlelit host views */
  /** `gatheringBasics`: section caps for host create-gathering parchment form */
  variant?:
    | "default"
    | "onDark"
    | "accountShell"
    | "hostShell"
    | "gatheringBasics";
}) {
  let labelClass: string;
  if (variant === "onDark") {
    labelClass = "text-gather-cream/80";
  } else if (variant === "accountShell") {
    labelClass =
      "font-serif text-[15px] tracking-[0.1em] text-gather-accent sm:text-[15.5px] sm:tracking-[0.095em]";
  } else if (variant === "hostShell") {
    labelClass =
      "text-[15px] font-semibold tracking-[0.1em] text-lc-tan-accent drop-shadow-[0_1px_16px_rgb(196_169_154_/_0.15)] sm:text-[15.5px]";
  } else if (variant === "gatheringBasics") {
    labelClass = "text-lc-settings-label";
  } else {
    labelClass = "text-gather-accent";
  }

  const barClass =
    variant === "accountShell"
      ? "h-1.5 w-6 rounded-full bg-gather-accent/80"
      : variant === "hostShell"
        ? "h-1.5 w-6 rounded-full bg-lc-tan-accent/88"
      : variant === "gatheringBasics"
        ? "h-1.5 w-6 rounded-full bg-gather-brown/45"
        : "h-1.5 w-5 rounded-full bg-gather-accent/75";

  const headingClass =
    variant === "accountShell"
      ? `flex items-center gap-2.5 font-semibold uppercase ${labelClass}`
      : variant === "hostShell"
        ? `flex items-center gap-2.5 font-sans font-semibold uppercase ${labelClass}`
      : variant === "gatheringBasics"
        ? `flex items-center gap-2.5 text-[13px] font-semibold uppercase tracking-[0.08em] sm:text-[14px] ${labelClass}`
        : `flex items-center gap-2.5 text-base font-semibold uppercase tracking-[0.08em] sm:text-[17px] sm:tracking-[0.07em] ${labelClass}`;

  return (
    <div
      className={`flex items-center justify-between gap-3 ${
        variant === "gatheringBasics" ? "mb-5 sm:mb-6" : "mb-4"
      } ${className}`}
    >
      <h2 className={headingClass}>
        <span className={barClass} aria-hidden />
        {title}
      </h2>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
