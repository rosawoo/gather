import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { nextAppPath } from "@/lib/onboarding";
import { PERSONALITY_PROMPTS } from "@/lib/prompts";
import { getUsedNeighborhoods } from "@/lib/neighborhoods";
import { NeighborhoodInput } from "@/components/neighborhood-input";
import { redirect } from "next/navigation";
import { completeProfile } from "@/app/actions/profile";
import { OnboardingScaffold } from "@/components/auth/onboarding-scaffold";
import { SectionTitle } from "@/components/ui/page-header";
import { PhotoUpload } from "@/components/photo-upload";

const inputCls =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gather-ink outline-none transition placeholder:text-neutral-400 focus:border-gather-accent focus:ring-2 focus:ring-gather-accent/40";

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
    <OnboardingScaffold
      step="profile"
      title="Your profile"
      subtitle="A few thoughtful details — like a dating app, but for gatherings."
    >
      <form action={completeProfile} className="space-y-8 pb-16">
        <Group title="Basics">
          <Field label="First name" required>
            <input name="firstName" required className={inputCls} />
          </Field>
          <Field label="Date of birth" hint="Must be 18 or older." required>
            <input
              name="dateOfBirth"
              type="date"
              required
              className={inputCls}
            />
          </Field>
        </Group>

        <Group
          title="Photos"
          hint="Drop images here or pick from your device. First photo is your primary."
        >
          <PhotoUpload />
        </Group>

        <Group title="Optional">
          <Field label="Neighborhood">
            <NeighborhoodInput
              name="neighborhood"
              extras={usedNeighborhoods}
              className={inputCls}
            />
          </Field>
          <Field label="College">
            <input name="college" placeholder="Where'd you go?" className={inputCls} />
          </Field>
          <Field label="Job">
            <input name="job" placeholder="What do you do?" className={inputCls} />
          </Field>
        </Group>

        <Group
          title="Bio"
          hint="Introduce yourself. What should people know?"
        >
          <textarea name="bio" required rows={4} className={inputCls} />
        </Group>

        <Group
          title="Personality prompts"
          hint="Answer at least two. These show on your profile."
        >
          {PERSONALITY_PROMPTS.map((p) => (
            <Field key={p.key} label={p.label}>
              <textarea
                name={`prompt_${p.key}`}
                rows={2}
                className={inputCls}
              />
            </Field>
          ))}
        </Group>

        <button
          type="submit"
          className="w-full rounded-full bg-gather-brown py-3.5 text-sm font-semibold text-gather-cream shadow-sm transition hover:bg-gather-brown-mid active:scale-[0.99]"
        >
          Complete profile
        </button>
      </form>
    </OnboardingScaffold>
  );
}

function Group({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <SectionTitle title={title} />
      {hint ? (
        <p className="-mt-2 mb-3 text-xs text-neutral-500">{hint}</p>
      ) : null}
      <div className="space-y-4 rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm ring-1 ring-black/[0.02]">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-baseline gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gather-brown-mid">
        <span>{label}</span>
        {required ? (
          <span className="text-gather-accent" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      {hint ? (
        <p className="mt-0.5 text-xs text-neutral-500">{hint}</p>
      ) : null}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
