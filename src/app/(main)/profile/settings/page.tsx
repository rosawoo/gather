import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="px-4 pb-28">
      <Link href="/profile" className="text-sm text-gather-brown hover:underline">
        ← Profile
      </Link>
      <h1 className="mt-4 text-xl font-semibold">Settings</h1>
      <ul className="mt-6 space-y-4 text-sm text-neutral-700">
        <li>
          <span className="font-medium">Plan &amp; billing</span> — Stripe
          portal (coming soon).
        </li>
        <li>
          <Link href="/profile/edit" className="font-medium text-gather-brown hover:underline">
            Edit profile
          </Link>
        </li>
        <li>
          <span className="font-medium">Policies</span> — cancellation &amp;
          token rules are enforced in-app; legal pages TBD.
        </li>
        <li>
          <span className="font-medium">SMS</span> — Reply STOP to opt out.
          Configure Twilio inbound webhook to{" "}
          <code className="text-xs">/api/twilio/sms</code> on your deployed URL.
        </li>
      </ul>
    </div>
  );
}
