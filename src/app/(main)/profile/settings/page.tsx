import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { signOutAction } from "@/app/actions/auth";
import { SmsToggle } from "./sms-toggle";
import { DeleteAccountButton } from "./delete-account-button";

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
    <div className="pb-28 space-y-8">
      {/* ── Account ── */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Account
        </h2>
        <dl className="mt-3 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500">Name</dt>
            <dd className="font-medium">
              {user.profile?.firstName ?? user.name ?? "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Email</dt>
            <dd className="font-medium">{user.email ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Phone</dt>
            <dd className="font-medium">
              {user.phone ?? "Not set"}
              {user.phoneVerified && (
                <span className="ml-1.5 text-xs text-green-600">Verified</span>
              )}
            </dd>
          </div>
        </dl>
      </section>

      {/* ── Plan & Tokens ── */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Plan &amp; tokens
        </h2>
        <dl className="mt-3 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500">Current plan</dt>
            <dd className="font-medium">
              {planLabels[user.plan] ?? user.plan}
            </dd>
          </div>
          {user.planStartedAt && (
            <div className="flex justify-between">
              <dt className="text-neutral-500">Member since</dt>
              <dd className="font-medium">
                {user.planStartedAt.toLocaleDateString()}
              </dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-neutral-500">Tokens available</dt>
            <dd className="font-medium">{user.tokensAvailable}</dd>
          </div>
          {user.tokensHeld > 0 && (
            <div className="flex justify-between">
              <dt className="text-neutral-500">Tokens held</dt>
              <dd className="font-medium text-amber-600">{user.tokensHeld}</dd>
            </div>
          )}
        </dl>
        <p className="mt-3 text-xs text-neutral-400">
          Billing portal coming soon (Stripe).
        </p>
      </section>

      {/* ── Notifications ── */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Notifications
        </h2>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">SMS notifications</p>
            <p className="text-xs text-neutral-500">
              Receive texts for join requests, approvals, and cancellations.
            </p>
          </div>
          <SmsToggle optedOut={user.smsOptOut} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">In-app notifications</p>
            <p className="text-xs text-neutral-500">
              Always on. Check the Notifications tab for updates.
            </p>
          </div>
          <span className="text-xs font-medium text-neutral-400">Always on</span>
        </div>
      </section>

      {/* ── Policies ── */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Policies
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-neutral-600">
          <li>
            <span className="font-medium text-neutral-800">Cancellation</span>
            {" "}— Guests can withdraw &gt;24h before an event for a full token
            refund. Within 24h, tokens are forfeited.
          </li>
          <li>
            <span className="font-medium text-neutral-800">Auto-cancel</span>
            {" "}— Gatherings that don&apos;t reach minimum group size within 2
            hours of the start time are automatically cancelled and tokens
            returned.
          </li>
          <li>
            <span className="font-medium text-neutral-800">Tokens</span>
            {" "}— Tokens are non-transferable. Held tokens are locked until the
            request is resolved.
          </li>
        </ul>
      </section>

      {/* ── Sign out ── */}
      <section>
        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full rounded-full border border-neutral-300 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition"
          >
            Sign out
          </button>
        </form>
      </section>

      {/* ── Danger zone ── */}
      <section className="rounded-xl border border-red-100 bg-white p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-red-400">
          Danger zone
        </h2>
        <p className="mt-2 text-xs text-neutral-500">
          Deleting your account removes all your data including your profile,
          photos, notifications, and token history.
        </p>
        <div className="mt-3">
          <DeleteAccountButton />
        </div>
      </section>
    </div>
  );
}
