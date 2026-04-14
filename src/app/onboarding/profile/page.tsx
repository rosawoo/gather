import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { nextAppPath } from "@/lib/onboarding";
import { PERSONALITY_PROMPTS } from "@/lib/prompts";
import { getUsedNeighborhoods } from "@/lib/neighborhoods";
import { NeighborhoodInput } from "@/components/neighborhood-input";
import { redirect } from "next/navigation";
import { completeProfile } from "@/app/actions/profile";

export default async function ProfileOnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });
  if (!user) redirect("/");
  if (!user.phoneVerified) redirect("/onboarding/phone");
  if (user.profileComplete) redirect(nextAppPath(user));

  const usedNeighborhoods = await getUsedNeighborhoods();

  return (
    <div className="min-h-full bg-gather-paper px-6 py-12 pb-28 text-gather-ink">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-medium tracking-tight">Your profile</h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          A few thoughtful details — like a dating app, but for gatherings.
        </p>

        <form action={completeProfile} className="mt-10 space-y-10">
          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Basics
            </h2>
            <div>
              <label className="text-xs text-neutral-500">First name *</label>
              <input
                name="firstName"
                required
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none ring-gather-accent focus:ring-2"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500">
                Date of birth * (18+)
              </label>
              <input
                name="dateOfBirth"
                type="date"
                required
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none ring-gather-accent focus:ring-2"
              />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Photos *
            </h2>
            <p className="text-xs text-neutral-500">
              Paste image URLs (comma or newline separated). First is your main
              photo. Replace with uploads when storage is wired.
            </p>
            <textarea
              name="photoUrls"
              required
              rows={3}
              placeholder="https://…"
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none ring-gather-accent focus:ring-2"
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Optional
            </h2>
            <NeighborhoodInput
              name="neighborhood"
              extras={usedNeighborhoods}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none ring-gather-accent focus:ring-2"
            />
            <input
              name="college"
              placeholder="College"
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none ring-gather-accent focus:ring-2"
            />
            <input
              name="job"
              placeholder="Job"
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none ring-gather-accent focus:ring-2"
            />
          </section>

          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Bio *
            </h2>
            <p className="text-sm text-neutral-600">
              Introduce yourself. What should people know about you?
            </p>
            <textarea
              name="bio"
              required
              rows={4}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none ring-gather-accent focus:ring-2"
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Personality prompts * (at least 2)
            </h2>
            {PERSONALITY_PROMPTS.map((p) => (
              <div key={p.key}>
                <label className="text-sm text-neutral-700">{p.label}</label>
                <textarea
                  name={`prompt_${p.key}`}
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none ring-gather-accent focus:ring-2"
                />
              </div>
            ))}
          </section>

          <button
            type="submit"
            className="w-full rounded-full bg-gather-brown py-3.5 text-sm font-medium text-gather-cream"
          >
            Complete profile
          </button>
        </form>
      </div>
    </div>
  );
}
