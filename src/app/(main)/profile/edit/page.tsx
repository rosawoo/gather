import { auth } from "@/auth";
import { updateProfile } from "@/app/actions/profile";
import { prisma } from "@/lib/prisma";
import { PERSONALITY_PROMPTS } from "@/lib/prompts";
import { redirect } from "next/navigation";

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
  const photoUrls = user.photos.map((ph) => ph.url).join("\n");

  return (
    <div className="pb-28">
      <p className="text-sm text-neutral-600">
        Update how you show up to hosts and guests.
      </p>

      <form action={updateProfile} className="mt-8 space-y-10">
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Basics
          </h2>
          <div>
            <label className="text-xs text-neutral-500">First name *</label>
            <input
              name="firstName"
              required
              defaultValue={p.firstName}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none ring-gather-accent focus:ring-2"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500">Date of birth * (18+)</label>
            <input
              name="dateOfBirth"
              type="date"
              required
              defaultValue={dob}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none ring-gather-accent focus:ring-2"
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Photos *
          </h2>
          <textarea
            name="photoUrls"
            required
            rows={3}
            defaultValue={photoUrls}
            placeholder="https://…"
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none ring-gather-accent focus:ring-2"
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Optional
          </h2>
          <input
            name="neighborhood"
            placeholder="Neighborhood"
            defaultValue={p.neighborhood ?? ""}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none ring-gather-accent focus:ring-2"
          />
          <input
            name="college"
            placeholder="College"
            defaultValue={p.college ?? ""}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none ring-gather-accent focus:ring-2"
          />
          <input
            name="job"
            placeholder="Job"
            defaultValue={p.job ?? ""}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none ring-gather-accent focus:ring-2"
          />
        </section>

        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Bio *
          </h2>
          <textarea
            name="bio"
            required
            rows={4}
            defaultValue={p.bio ?? ""}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none ring-gather-accent focus:ring-2"
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Personality prompts * (at least 2)
          </h2>
          {PERSONALITY_PROMPTS.map((pr) => {
            const existing = user.promptAnswers.find((a) => a.promptKey === pr.key);
            return (
              <div key={pr.key}>
                <label className="text-sm text-neutral-700">{pr.label}</label>
                <textarea
                  name={`prompt_${pr.key}`}
                  rows={2}
                  defaultValue={existing?.body ?? ""}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none ring-gather-accent focus:ring-2"
                />
              </div>
            );
          })}
        </section>

        <button
          type="submit"
          className="w-full rounded-full bg-gather-brown py-3.5 text-sm font-medium text-gather-cream"
        >
          Save changes
        </button>
      </form>
    </div>
  );
}
