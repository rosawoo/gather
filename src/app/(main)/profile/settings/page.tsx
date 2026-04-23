import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { signOutAction } from "@/app/actions/auth";
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

  return (
    <div className="space-y-8 pb-10">
      <p className="text-sm text-neutral-600">
        Account, plan, and notification preferences.
      </p>

      <section>
        <SectionTitle title="Account" />
        <Card>
          <Row label="Name">
            {user.profile?.firstName ?? user.name ?? "—"}
          </Row>
          <Row label="Email">{user.email ?? "—"}</Row>
          <Row label="Phone">
            <span>{user.phone ?? "Not set"}</span>
            {user.phoneVerified && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700 ring-1 ring-emerald-200">
                Verified
              </span>
            )}
          </Row>
        </Card>
      </section>

      <section>
        <SectionTitle title="Plan & tokens" />
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
              <span className="text-amber-600">{user.tokensHeld}</span>
            </Row>
          )}
          <p className="pt-1 text-xs text-neutral-500">
            Billing portal coming soon (Stripe).
          </p>
        </Card>
      </section>

      <section>
        <SectionTitle title="Notifications" />
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gather-ink">
                SMS notifications
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                Receive texts for join requests, approvals, and cancellations.
              </p>
            </div>
            <SmsToggle optedOut={user.smsOptOut} />
          </div>
          <div className="flex items-start justify-between gap-3 border-t border-neutral-100 pt-4">
            <div>
              <p className="text-sm font-semibold text-gather-ink">
                In-app notifications
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                Always on. Check the Notifications tab for updates.
              </p>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Always on
            </span>
          </div>
        </Card>
      </section>

      <section>
        <SectionTitle title="Policies" />
        <Card>
          <ul className="space-y-3 text-sm text-neutral-700">
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
            className="w-full rounded-full border border-neutral-300 bg-white py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            Sign out
          </button>
        </form>
      </section>

      <section>
        <SectionTitle title="Danger zone" />
        <div className="rounded-2xl border border-red-200/70 bg-white p-4 shadow-sm ring-1 ring-red-100">
          <p className="text-xs text-neutral-500">
            Deleting your account removes all your data including your profile,
            photos, notifications, and token history.
          </p>
          <div className="mt-3">
            <DeleteAccountButton />
          </div>
        </div>
      </section>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm ring-1 ring-black/[0.02]">
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
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="font-semibold text-gather-ink">{children}</span>
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
      <span className="font-semibold text-gather-ink">{title}</span>{" "}
      <span className="text-neutral-600">— {children}</span>
    </li>
  );
}
