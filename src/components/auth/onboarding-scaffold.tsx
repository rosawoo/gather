import Link from "next/link";

type Step = "phone" | "profile" | "plan";

const STEPS: { key: Step; label: string; href: string }[] = [
  { key: "phone", label: "Phone", href: "/onboarding/phone" },
  { key: "profile", label: "Profile", href: "/onboarding/profile" },
  { key: "plan", label: "Plan", href: "/onboarding/plan" },
];

export function OnboardingScaffold({
  step,
  title,
  subtitle,
  children,
}: {
  step: Step;
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}) {
  const activeIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="min-h-full bg-gather-paper px-5 py-10 text-gather-ink sm:py-14">
      <div className="mx-auto flex w-full max-w-md flex-col">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-gather-teal/90 transition hover:text-gather-teal"
        >
          <span
            className="h-1 w-4 rounded-full bg-gather-teal/90"
            aria-hidden
          />
          Gather
        </Link>

        <ol className="mt-6 flex items-center gap-2">
          {STEPS.map((s, i) => {
            const state =
              i < activeIndex ? "done" : i === activeIndex ? "active" : "todo";
            return (
              <li
                key={s.key}
                className="flex flex-1 items-center gap-2"
                aria-current={state === "active" ? "step" : undefined}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition ${
                    state === "done"
                      ? "bg-gather-wine text-gather-cream"
                      : state === "active"
                        ? "bg-gather-teal text-gather-cream ring-4 ring-gather-teal/25"
                        : "bg-gather-line/50 text-gather-charcoal/80"
                  }`}
                >
                  {state === "done" ? (
                    <svg
                      className="h-3 w-3"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M2.5 6 5 8.5 9.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={`truncate text-[11px] font-semibold uppercase tracking-[0.14em] ${
                    state === "todo"
                      ? "text-gather-charcoal/55"
                      : "text-gather-teal"
                  }`}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 ? (
                  <span
                    className={`h-px flex-1 ${i < activeIndex ? "bg-gather-wine/70" : "bg-gather-line/50"}`}
                    aria-hidden
                  />
                ) : null}
              </li>
            );
          })}
        </ol>

        <div className="mt-10">
          <h1 className="font-serif text-3xl font-light tracking-tight text-gather-ink sm:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-sm leading-relaxed text-gather-charcoal">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
