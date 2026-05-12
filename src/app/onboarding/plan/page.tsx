import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Plan } from "@prisma/client";
import { redirect } from "next/navigation";
import { selectOgPlan } from "@/app/actions/plan";
import { OnboardingScaffold } from "@/components/auth/onboarding-scaffold";

type PlanCardProps = {
  id: "og" | "observer" | "member";
  eyebrow: string;
  name: string;
  priceMain: string;
  priceSub: string;
  tagline: string;
  perks: { label: string; included: boolean }[];
  month: string[];
  cta: React.ReactNode;
  highlight?: boolean;
  billingFootnote?: string;
};

const PLANS: Omit<PlanCardProps, "cta">[] = [
  {
    id: "og",
    eyebrow: "OG: Original Gatherer",
    name: "OG",
    priceMain: "Free",
    priceSub: "for 1 month",
    tagline: "The beta launch plan.",
    perks: [
      { label: "Access to all events", included: true },
      { label: "1 token included", included: true },
      { label: "Can host events", included: true },
      { label: "Beta access", included: true },
    ],
    month: [
      "Unlimited casual hangs: knitting circles, pickleball, neighborhood plans, an easy run.",
      "1 included hosted gathering where tokens help cover food or drinks: dinner parties, game nights, or football watch parties.",
      "Full access to join or host any gathering on Gather.",
    ],
    highlight: true,
  },
  {
    id: "observer",
    eyebrow: "Observer",
    name: "Observer",
    priceMain: "$4.99",
    priceSub: "per month",
    tagline: "Stay in the loop, zero pressure.",
    billingFootnote:
      "When available, Observer renews automatically each month. Cancel anytime in billing settings; plan changes take effect on your next renewal so the current period stays intact.",
    perks: [
      { label: "Access to free & 1-token events", included: true },
      { label: "No tokens included", included: true },
      { label: "Cannot see 2+ token events", included: false },
      { label: "Cannot host events", included: false },
    ],
    month: [
      "Unlimited casual hangs: knitting circles, pickleball, neighborhood plans, an easy run.",
      "Browsing tokened hosted gatherings and joining one when the timing feels right.",
    ],
  },
  {
    id: "member",
    eyebrow: "Member",
    name: "Member",
    priceMain: "$11.99",
    priceSub: "per month",
    tagline: "Core plan for most people.",
    billingFootnote:
      "When available, Member renews automatically each month with your included token. Switch plans after your current period ends so perks stay predictable—manage it from Settings → Plan & tokens.",
    perks: [
      { label: "Access to all events", included: true },
      { label: "1 token per month", included: true },
      { label: "Can host events", included: true },
      { label: "Tokens roll over", included: true },
    ],
    month: [
      "Unlimited casual hangs: knitting circles, pickleball, neighborhood plans, an easy run.",
      "1 included hosted gathering each month where tokens help cover food or drinks: dinner parties, game nights, or football watch parties.",
      "Full access to join or host any gathering on Gather.",
    ],
  },
];

export default async function PlanPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });
  if (!user) redirect("/");
  if (!user.profileComplete) redirect("/onboarding/profile");
  if (user.plan !== Plan.NONE) redirect("/gatherings");

  return (
    <OnboardingScaffold
      step="plan"
      title="Choose your plan"
      subtitle={
        <>
          For the beta, only <strong>OG</strong> is available, free for your
          first month. Observer and Member arrive after beta.
          <span className="mt-3 block text-xs font-normal text-gather-charcoal">
            Paid plans renew automatically each billing period. You can cancel
            renewal or schedule a tier change from Settings → Plan & tokens; a
            new plan typically starts when your current paid period ends.
          </span>
        </>
      }
    >
      <div className="space-y-5 pb-8">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            {...plan}
            cta={
              plan.id === "og" ? (
                <form action={selectOgPlan}>
                  <button
                    type="submit"
                    className="w-full rounded-full bg-gather-brown py-3.5 text-sm font-semibold text-gather-cream shadow-sm transition hover:bg-gather-brown-mid active:scale-[0.99]"
                  >
                    Select OG
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-full border border-gather-teal/35 bg-white py-3.5 text-sm font-semibold text-gather-charcoal/55"
                  aria-disabled
                >
                  Available after beta
                </button>
              )
            }
          />
        ))}
      </div>
    </OnboardingScaffold>
  );
}

function PlanCard({
  eyebrow,
  priceMain,
  priceSub,
  tagline,
  perks,
  month,
  cta,
  highlight,
  billingFootnote,
}: PlanCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm ring-1 transition ${
        highlight
          ? "border-gather-accent/40 ring-gather-accent/10 shadow-md"
          : "border-gather-teal/25 ring-black/[0.02]"
      }`}
    >
      {highlight ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gather-accent/20 blur-2xl"
        />
      ) : null}

      <div className="relative">
        <div className="flex items-center gap-2">
          <span
            className="h-1 w-4 rounded-full bg-gather-accent/90"
            aria-hidden
          />
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gather-brown-mid">
            {eyebrow}
          </p>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-serif text-4xl font-light tracking-tight text-gather-ink">
            {priceMain}
          </span>
          <span className="text-sm text-gather-charcoal/80">{priceSub}</span>
        </div>
        <p className="mt-1 text-sm text-gather-charcoal">{tagline}</p>

        <ul className="mt-5 space-y-2.5 text-sm text-gather-ink">
          {perks.map((perk) => (
            <li key={perk.label} className="flex items-start gap-2.5">
              <span
                aria-hidden
                className={`mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  perk.included
                    ? "bg-gather-brown text-gather-cream"
                    : "bg-gather-line/50 text-gather-charcoal/55"
                }`}
              >
                {perk.included ? "+" : "\u2212"}
              </span>
              <span
                className={perk.included ? "" : "text-gather-charcoal/80 line-through"}
              >
                {perk.label}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5 rounded-2xl bg-gather-paper/80 px-4 py-3 ring-1 ring-gather-teal/20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gather-brown-mid">
            What your month could look like
          </p>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-gather-ink">
            {month.map((line) => (
              <li key={line} className="flex gap-2">
                <span aria-hidden className="text-gather-accent">
                  •
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        {billingFootnote ? (
          <p className="mt-4 text-xs leading-relaxed text-gather-charcoal/90">
            {billingFootnote}
          </p>
        ) : null}

        <div className="mt-5">{cta}</div>
      </div>
    </div>
  );
}
