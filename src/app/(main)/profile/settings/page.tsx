import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { signOutAction } from "@/app/actions/auth";
import { billingPortalRedirect } from "@/app/actions/billing";
import { isStripeConfigured } from "@/lib/stripe";
import Link from "next/link";
import { SmsToggle } from "./sms-toggle";
import { DeleteAccountButton } from "./delete-account-button";
import { SectionTitle } from "@/components/ui/page-header";

const planLabels: Record<string, string> = {
  NONE: "No plan",
  OG: "OG (Beta)",
  OBSERVER: "Observer",
  MEMBER: "Member",
};

export default async function SettingsPage() {
  const session = await auth();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session!.user!.id },
    include: { profile: true },
  });

  const stripeOk = isStripeConfigured();

  return (
    <div className="mx-auto max-w-xl space-y-10 pb-12 font-serif">
      <p className="text-[15px] leading-relaxed text-lc-earth-muted">
        Account, plan, and notification preferences.
      </p>

      <section>
        <SectionTitle title="Account" variant="accountShell" />
        <Card>
          <Row label="Name">
            {user.profile?.firstName ?? user.name ?? "None"}
          </Row>
          <Row label="Email">{user.email ?? "None"}</Row>
          <Row label="Phone">
            <span>{user.phone ?? "Not set"}</span>
            {user.phoneVerified ? (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-900/[0.08] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-900 ring-1 ring-emerald-800/25">
                Verified
              </span>
            ) : (
              <a
                href="/onboarding/phone"
                className="ml-2 text-[13px] font-semibold text-gather-accent underline-offset-4 hover:underline"
              >
                Add for SMS alerts (US only)
              </a>
            )}
          </Row>
        </Card>
      </section>

      <section>
        <SectionTitle title="Plan & tokens" variant="accountShell" />
        <Card>
          <Row label="Current plan">{planLabels[user.plan] ?? user.plan}</Row>
          {user.planStartedAt && (
            <Row label="Member since">
              {user.planStartedAt.toLocaleDateString()}
            </Row>
          )}
          <Row label="Tokens available">{user.tokensAvailable}</Row>
          {user.tokensHeld > 0 && (
            <Row label="Tokens held">
              <span className="text-amber-800">{user.tokensHeld}</span>
            </Row>
          )}
          {stripeOk && user.stripeCustomerId ? (
            <form action={billingPortalRedirect} className="pt-2">
              <button
                type="submit"
                className="w-full rounded-full bg-gather-accent py-3 text-[15px] font-semibold text-gather-cream shadow-[0_6px_20px_-8px_rgb(72_42_38_/_0.5)] transition hover:bg-gather-brown-mid"
              >
                Manage billing & invoices
              </button>
              <p className="mt-3 font-sans text-[13px] leading-[1.45] text-lc-settings-helper">
                Opens Stripe&apos;s customer portal (payment methods, history,
                cancellations). Subscription changes and downgrades usually take
                effect at the end of the current billing period; see Stripe for
                your dates.
              </p>
            </form>
          ) : stripeOk ? (
            <p className="pt-2 font-sans text-[13px] leading-[1.45] text-lc-settings-helper">
              Complete a token purchase with card checkout to link a Stripe
              customer. Then you can manage payment methods and receipts here.
            </p>
          ) : (
            <p className="pt-2 font-sans text-[13px] leading-[1.45] text-lc-settings-helper">
              Stripe isn&apos;t configured in this environment. See{" "}
              <code className="rounded bg-black/[0.04] px-1 font-mono text-[12px] text-lc-settings-ink-strong">
                .env.example
              </code>{" "}
              for setup.
            </p>
          )}
        </Card>
      </section>

      <section>
        <SectionTitle title="Notifications" variant="accountShell" />
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 pr-2">
              <p className="text-[15px] font-semibold text-lc-settings-ink-strong">
                SMS notifications
              </p>
              <p className="mt-2 font-sans text-[13px] leading-[1.45] text-lc-settings-helper">
                Receive texts for join requests, approvals, and cancellations.
                Hosts also get SMS nudges to submit reimbursements after a
                gathering when expenses are pending.
              </p>
            </div>
            <SmsToggle optedOut={user.smsOptOut} />
          </div>
          <div className="flex items-start justify-between gap-4 border-t border-lc-control-brown/14 pt-5">
            <div className="min-w-0 pr-2">
              <p className="text-[15px] font-semibold text-lc-settings-ink-strong">
                In-app notifications
              </p>
              <p className="mt-2 font-sans text-[13px] leading-[1.45] text-lc-settings-helper">
                Always on. Includes join and approval updates, plus reimbursement
                reminders for hosts after events.
              </p>
            </div>
            <span className="shrink-0 pt-1 font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-lc-settings-helper">
              Always on
            </span>
          </div>
        </Card>
      </section>

      <section>
        <SectionTitle title="Legal" variant="accountShell" />
        <Card>
          <ul className="space-y-3 text-[15px] leading-snug">
            <li>
              <Link
                href="/about"
                className="font-semibold text-gather-accent underline-offset-4 hover:underline"
              >
                How it works
              </Link>
            </li>
            <li>
              <Link
                href="/terms-of-service"
                className="font-semibold text-gather-accent underline-offset-4 hover:underline"
              >
                Terms of service
              </Link>
            </li>
            <li>
              <Link
                href="/privacy-policy"
                className="font-semibold text-gather-accent underline-offset-4 hover:underline"
              >
                Privacy policy
              </Link>
            </li>
            <li>
              <Link
                href="/community-guidelines"
                className="font-semibold text-gather-accent underline-offset-4 hover:underline"
              >
                Community guidelines
              </Link>
            </li>
          </ul>
        </Card>
      </section>

      <section>
        <SectionTitle title="Policies" variant="accountShell" />
        <Card>
          <ul className="space-y-4 font-sans text-[15px] leading-relaxed">
            <Policy title="Cancellation">
              Guests can withdraw &gt;24h before an event for a full token
              refund. Within 24h, tokens are forfeited.
            </Policy>
            <Policy title="Auto-cancel">
              Gatherings that don&apos;t reach minimum group size within 2
              hours of the start time are automatically cancelled and tokens
              returned.
            </Policy>
            <Policy title="Tokens">
              Tokens are non-transferable. Held tokens are locked until the
              request is resolved.
            </Policy>
          </ul>
        </Card>
      </section>

      <section>
        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full rounded-full border border-lc-control-brown/38 bg-lc-settings-parchment-soft py-3.5 text-[15px] font-semibold text-lc-settings-ink-strong shadow-[inset_0_1px_0_rgb(255_255_255_/_0.45)] backdrop-blur-sm transition hover:border-lc-control-brown/50 hover:bg-lc-settings-parchment"
          >
            Sign out
          </button>
        </form>
      </section>

      <section>
        <SectionTitle title="Danger zone" variant="accountShell" />
        <div className="rounded-2xl border border-red-900/28 bg-[rgb(246_229_229_/_0.88)] p-5 shadow-[0_14px_40px_-22px_rgb(92_26_26_/_0.45)] ring-1 ring-red-950/[0.08] backdrop-blur-[2px]">
          <p className="font-sans text-[13px] leading-[1.45] text-lc-body-rich">
            Deleting your account removes all your data including your profile,
            photos, notifications, and token history.
          </p>
          <div className="mt-4">
            <DeleteAccountButton />
          </div>
        </div>
      </section>
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`space-y-4 rounded-xl border border-lc-pale-blue-border/55 bg-lc-settings-parchment-soft px-[1.125rem] py-5 shadow-[0_20px_52px_-28px_rgb(26_14_12_/_0.78)] ring-1 ring-black/[0.04] sm:px-5 ${className}`}
    >
      {children}
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-[15px]">
      <span className="shrink-0 font-medium text-lc-settings-label">
        {label}
      </span>
      <span className="min-w-0 text-right font-semibold text-lc-settings-ink-strong">
        {children}
      </span>
    </div>
  );
}

function Policy({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <span className="font-semibold text-lc-settings-ink-strong">{title}:</span>{" "}
      <span className="text-lc-settings-helper">{children}</span>
    </li>
  );
}
