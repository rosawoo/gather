import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Plan } from "@prisma/client";
import { redirect } from "next/navigation";
import { selectOgPlan } from "@/app/actions/plan";

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

  return (
    <div className="min-h-full bg-gather-paper px-6 py-12 pb-28 text-gather-ink">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-medium tracking-tight">Choose your plan</h1>
        <p className="mt-2 text-sm text-neutral-600">
          For the beta launch, only <strong>OG</strong> is available — free for
          your first month.
        </p>

        <div className="mt-10 rounded-2xl border border-gather-accent/40 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gather-brown-mid">
            OG — Original Gatherer
          </p>
          <p className="mt-1 text-lg font-medium">Free for 1 month</p>
          <ul className="mt-4 space-y-2 text-sm text-neutral-700">
            <li>✓ Access to all events</li>
            <li>✓ 1 token included</li>
            <li>✓ Can host events</li>
            <li>✓ Beta access</li>
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-neutral-500">
            Observer ($4.99) and Member ($11.99) will appear here after beta.
          </p>
          <form action={selectOgPlan} className="mt-6">
            <button
              type="submit"
              className="w-full rounded-full bg-gather-brown py-3.5 text-sm font-medium text-gather-cream"
            >
              Select OG
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
