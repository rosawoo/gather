import { GatherWordmarkLink } from "@/components/branding/gather-wordmark-link";
import { MainAppCandlelitShell } from "@/components/main-app-candlelit-shell";
import { lcChrome } from "@/lib/lc-classes";

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
    <MainAppCandlelitShell>
      <div className="landing-candlelit relative z-10 min-h-full px-4 py-10 sm:px-6 sm:py-14 lg:px-10 xl:px-14">
        <div className="mx-auto flex w-full max-w-lg flex-col">
          <div className="flex justify-center">
            <GatherWordmarkLink href="/" size="landingSticky" />
          </div>

          <ol className="mt-8 flex items-center gap-2 sm:mt-10">
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
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold transition ${
                      state === "done"
                        ? "bg-gather-wine text-lc-cream"
                        : state === "active"
                          ? "bg-lc-dusty-blue text-lc-cream ring-[3px] ring-lc-pale-blue-border/35"
                          : "bg-lc-warm-shadow/55 text-lc-tan-accent"
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
                    className={`truncate text-[13px] font-semibold uppercase tracking-[0.1em] sm:text-sm sm:tracking-[0.12em] ${
                      state === "todo"
                        ? "text-lc-tan-accent/75"
                        : "text-lc-link-soft"
                    }`}
                  >
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 ? (
                    <span
                      className={`h-px flex-1 ${i < activeIndex ? "bg-lc-dusty-blue/85" : "bg-lc-pale-blue-border/25"}`}
                      aria-hidden
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>

          <div className="mt-10">
            <h2 className="font-serif text-3xl font-light tracking-tight text-lc-cream sm:text-4xl">
              {title}
            </h2>
            {subtitle ? (
              <p className={`mt-2 text-sm leading-relaxed ${lcChrome.subtitle}`}>
                {subtitle}
              </p>
            ) : null}
          </div>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </MainAppCandlelitShell>
  );
}
