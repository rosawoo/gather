import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Plan } from "@prisma/client";
import { redirect } from "next/navigation";
import { selectOgPlan } from "@/app/actions/plan";
import { OnboardingScaffold } from "@/components/auth/onboarding-scaffold";

export default async function PlanPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });
  if (!user) redirect("/");
  if (!user.phoneVerified) redirect("/onboarding/phone");
  if (!user.profileComplete) redirect("/onboarding/profile");
  if (user.plan !== Plan.NONE) redirect("/gatherings");

  const perks = [
    "Access to every gathering",
    "1 token included to start",
    "Host your own gatherings",
    "Early access during beta",
  ];

  return (
    <OnboardingScaffold
      step="plan"
      title="Choose your plan"
      subtitle={
        <>
          For the beta, only <strong>OG</strong> is available — free for your
          first month.
        </>
      }
    >
      <div className="relative overflow-hidden rounded-3xl border border-gather-accent/30 bg-white p-6 shadow-md ring-1 ring-black/[0.04]">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gather-accent/20 blur-2xl"
        />

        <div className="relative">
          <div className="flex items-center gap-2">
            <span
              className="h-1 w-4 rounded-full bg-gather-accent/90"
              aria-hidden
            />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gather-brown-mid">
              OG — Original Gatherer
            </p>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-4xl font-light tracking-tight text-gather-ink">
              Free
            </span>
            <span className="text-sm text-neutral-500">for 1 month</span>
          </div>

          <ul className="mt-5 space-y-2.5 text-sm text-gather-ink">
            {perks.map((perk) => (
              <li key={perk} className="flex items-start gap-2.5">
                <span
                  aria-hidden
                  className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gather-brown text-[10px] font-bold text-gather-cream"
                >
                  ✓
                </span>
                {perk}
              </li>
            ))}
          </ul>

          <p className="mt-5 rounded-xl bg-gather-paper/80 px-3 py-2 text-xs leading-relaxed text-neutral-600 ring-1 ring-neutral-200/70">
            Observer ($4.99) and Member ($11.99) will appear here after beta.
          </p>

          <form action={selectOgPlan} className="mt-6">
            <button
              type="submit"
              className="w-full rounded-full bg-gather-brown py-3.5 text-sm font-semibold text-gather-cream shadow-sm transition hover:bg-gather-brown-mid active:scale-[0.99]"
            >
              Select OG
            </button>
          </form>
        </div>
      </div>
    </OnboardingScaffold>
  );
}
