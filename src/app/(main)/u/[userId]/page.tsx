import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PERSONALITY_PROMPTS } from "@/lib/prompts";
import { ageFromDob } from "@/lib/gathering-display";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionTitle } from "@/components/ui/page-header";

function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-200/90 bg-white/90 px-3 py-1 text-xs font-medium text-neutral-700 shadow-sm">
      {children}
    </span>
  );
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await auth();
  const { userId } = await params;

  const u = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      photos: { orderBy: { sortOrder: "asc" } },
      promptAnswers: true,
    },
  });

  if (!u?.profile) notFound();

  const primary = u.photos.find((p) => p.isPrimary) ?? u.photos[0];
  const p = u.profile;
  const meta = [p.neighborhood, p.college, p.job].filter(Boolean);

  return (
    <div className="space-y-8 pb-10">
      <Link
        href="/gatherings"
        className="inline-flex items-center gap-1 text-sm text-gather-brown-mid transition hover:text-gather-brown"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
            clipRule="evenodd"
          />
        </svg>
        Back
      </Link>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white via-gather-cream/40 to-gather-cream/20 px-5 pb-8 pt-10 shadow-md ring-1 ring-black/[0.06]">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gather-accent/15 blur-2xl"
        />
        <div className="relative flex flex-col items-center text-center">
          {primary?.url || u.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primary?.url ?? u.image!}
              alt=""
              className="h-32 w-32 rounded-full object-cover shadow-lg ring-[5px] ring-white ring-offset-4 ring-offset-gather-cream/30"
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-neutral-200/90 text-xs text-neutral-400 ring-[5px] ring-white ring-offset-4 ring-offset-gather-cream/30">
              No photo
            </div>
          )}
          <h1 className="mt-6 font-serif text-3xl font-light tracking-tight text-gather-ink sm:text-4xl">
            {p.firstName}
          </h1>
          <p className="mt-1 text-sm font-medium text-gather-brown-mid">
            {ageFromDob(p.dateOfBirth)} years old
          </p>
          {meta.length > 0 ? (
            <div className="mt-5 flex max-w-sm flex-wrap justify-center gap-2">
              {meta.map((m) => (
                <MetaChip key={m as string}>{m}</MetaChip>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section>
        <SectionTitle title="About" />
        <div className="rounded-2xl border border-neutral-200/70 bg-white px-5 py-4 shadow-sm ring-1 ring-black/[0.02]">
          <p className="text-[15px] leading-relaxed text-gather-ink">{p.bio}</p>
        </div>
      </section>

      <section>
        <SectionTitle title="Prompts" />
        <div className="space-y-3">
          {PERSONALITY_PROMPTS.map((pr) => {
            const ans = u.promptAnswers.find((a) => a.promptKey === pr.key);
            if (!ans) return null;
            return (
              <article
                key={pr.key}
                className="rounded-2xl border border-neutral-200/70 bg-white px-4 py-4 shadow-sm ring-1 ring-black/[0.02]"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gather-brown-mid">
                  {pr.label}
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-gather-ink">
                  {ans.body}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {u.photos.length > 0 ? (
        <section>
          <SectionTitle title="Photos" />
          <div className="grid grid-cols-3 gap-2">
            {u.photos.map((ph) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={ph.id}
                src={ph.url}
                alt=""
                className="aspect-square w-full rounded-xl object-cover shadow-sm ring-1 ring-black/[0.04]"
              />
            ))}
          </div>
        </section>
      ) : null}

      <div className="pt-2 text-center">
        <Link
          href={`/report?type=user&id=${userId}`}
          className="text-xs text-neutral-500 transition hover:text-gather-ink hover:underline"
        >
          Report profile
        </Link>
      </div>
    </div>
  );
}
