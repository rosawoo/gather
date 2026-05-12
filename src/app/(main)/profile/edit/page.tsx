import { auth } from "@/auth";
import { updateProfile } from "@/app/actions/profile";
import { prisma } from "@/lib/prisma";
import { PersonalityPromptSlots } from "@/components/personality-prompt-slots";
import { getUsedNeighborhoods } from "@/lib/neighborhoods";
import { NeighborhoodInput } from "@/components/neighborhood-input";
import { redirect } from "next/navigation";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { PhotoUpload } from "@/components/photo-upload";

const inputCls =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gather-ink outline-none transition placeholder:text-neutral-400 focus:border-gather-accent focus:ring-2 focus:ring-gather-accent/40";

export default async function EditProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      photos: { orderBy: { sortOrder: "asc" } },
      promptAnswers: true,
    },
  });
  if (!user?.profile) redirect("/onboarding/profile");

  const p = user.profile;
  const dob = p.dateOfBirth.toISOString().slice(0, 10);
  const usedNeighborhoods = await getUsedNeighborhoods();
  const initialPhotoUrls = user.photos.map((ph) => ph.url);

  return (
    <div className="pb-10">
      <PageHeader
        title="Edit profile"
        subtitle="Update how you show up to hosts and guests."
      />

      <form action={updateProfile} className="space-y-8">
        <Group title="Basics">
          <Field label="First name" required>
            <input
              name="firstName"
              required
              defaultValue={p.firstName}
              className={inputCls}
            />
          </Field>
          <Field label="Date of birth" hint="Must be 21 or older." required>
            <input
              name="dateOfBirth"
              type="date"
              required
              defaultValue={dob}
              className={inputCls}
            />
          </Field>
        </Group>

        <Group
          title="Photos"
          hint="Drop images here or pick from your device. First photo is your primary."
        >
          <PhotoUpload initialUrls={initialPhotoUrls} />
        </Group>

        <Group title="Optional">
          <Field label="Neighborhood">
            <NeighborhoodInput
              name="neighborhood"
              defaultValue={p.neighborhood ?? ""}
              extras={usedNeighborhoods}
              className={inputCls}
            />
          </Field>
          <Field label="College">
            <input
              name="college"
              placeholder="Where'd you go?"
              defaultValue={p.college ?? ""}
              className={inputCls}
            />
          </Field>
          <Field label="Job">
            <input
              name="job"
              placeholder="What do you do?"
              defaultValue={p.job ?? ""}
              className={inputCls}
            />
          </Field>
        </Group>

        <Group title="Bio" hint="A sentence or two. What are you like around a table?">
          <textarea
            name="bio"
            required
            rows={4}
            defaultValue={p.bio ?? ""}
            className={inputCls}
          />
        </Group>

        <Group
          title="Personality prompts"
          hint="Pick a question for each line, then answer at least two."
        >
          <PersonalityPromptSlots
            inputClassName={inputCls}
            initialAnswers={user.promptAnswers.map((a) => ({
              key: a.promptKey,
              body: a.body,
            }))}
          />
        </Group>

        <button
          type="submit"
          className="w-full rounded-full bg-gather-brown py-3.5 text-sm font-semibold text-gather-cream shadow-sm transition hover:bg-gather-brown-mid active:scale-[0.99]"
        >
          Save changes
        </button>
      </form>
    </div>
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
