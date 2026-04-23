import { auth } from "@/auth";
import { TokenExplainer } from "@/components/token-explainer";
import { prisma } from "@/lib/prisma";
import { PERSONALITY_PROMPTS } from "@/lib/prompts";
import { ageFromDob } from "@/lib/gathering-display";
import Link from "next/link";
import { SectionTitle } from "@/components/ui/page-header";
import { signOutAction } from "@/app/actions/auth";

function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-200/90 bg-white/90 px-3 py-1 text-xs font-medium text-neutral-700 shadow-sm">
      {children}
    </span>
  );
}

export default async function ProfilePage() {
  const session = await auth();
  const userId = session!.user!.id;

  const u = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      profile: true,
      photos: { orderBy: { sortOrder: "asc" } },
      promptAnswers: true,
    },
  });

  const primary = u.photos.find((p) => p.isPrimary) ?? u.photos[0];
  const p = u.profile!;

  const meta = [p.neighborhood, p.college, p.job].filter(Boolean);

  return (
    <div className="space-y-8 pb-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white via-gather-cream/40 to-gather-cream/20 px-5 pb-8 pt-10 shadow-md ring-1 ring-black/[0.06]">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gather-accent/15 blur-2xl"
          aria-hidden
        />
        <div className="relative flex flex-col items-center text-center">
          <div className="relative">
            {primary?.url || u.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primary?.url ?? u.image!}
                alt=""
                className="h-32 w-32 rounded-full object-cover shadow-lg ring-[5px] ring-white ring-offset-4 ring-offset-gather-cream/30"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-neutral-200/90 text-neutral-400 ring-[5px] ring-white ring-offset-4 ring-offset-gather-cream/30">
                <span className="text-xs">No photo</span>
              </div>
            )}
          </div>
          <h1 className="mt-6 font-serif text-3xl font-light tracking-tight text-gather-ink sm:text-4xl">
            {p.firstName}
          </h1>
          <p className="mt-1 text-sm font-medium text-gather-brown-mid">
            {ageFromDob(p.dateOfBirth)} years old
          </p>
          {meta.length > 0 ? (
            <div className="mt-5 flex max-w-sm flex-wrap justify-center gap-2">
              {meta.map((m) => (
                <MetaChip key={m}>{m}</MetaChip>
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

      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-gather-brown via-gather-brown to-gather-brown-mid p-5 text-gather-cream shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-gather-cream/80">
              <span
                className="h-1 w-4 rounded-full bg-gather-accent/90"
                aria-hidden
              />
              Token wallet
            </h2>
            <p className="mt-1.5 text-[11px] leading-snug text-gather-cream/70">
              Available vs held for pending requests.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gather-cream/90">
            {u.plan}
          </span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-black/15 px-3 py-3 text-center ring-1 ring-white/5">
            <p className="font-serif text-3xl font-light tabular-nums">
              {u.tokensAvailable}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-gather-cream/75">
              Available
            </p>
          </div>
          <div className="rounded-2xl bg-black/15 px-3 py-3 text-center ring-1 ring-white/5">
            <p className="font-serif text-3xl font-light tabular-nums">
              {u.tokensHeld}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-gather-cream/75">
              Held
            </p>
          </div>
        </div>
        <TokenExplainer variant="onDark" className="mt-4" />
        <Link
          href="/profile/tokens"
          className="mt-5 flex w-full items-center justify-center rounded-full bg-gather-cream py-3 text-sm font-semibold text-gather-brown shadow-sm transition hover:bg-white hover:shadow-md active:scale-[0.99]"
        >
          Buy tokens
        </Link>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <QuickAction href="/profile/edit">Edit profile</QuickAction>
        <QuickAction href="/profile/notifications">Notifications</QuickAction>
        <QuickAction href="/profile/settings">Settings</QuickAction>
        <QuickAction href="/report" variant="dashed">
          Report an issue
        </QuickAction>
      </section>

      <form action={signOutAction}>
        <button
          type="submit"
          className="w-full rounded-full border border-neutral-300 bg-white py-3 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-gather-brown-mid hover:bg-neutral-50 hover:text-gather-brown"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

function QuickAction({
  href,
  children,
  variant = "solid",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "dashed";
}) {
  const base =
    "flex items-center justify-center rounded-2xl py-3.5 text-sm transition";
  const styles =
    variant === "dashed"
      ? "border border-dashed border-neutral-300 bg-gather-paper font-medium text-neutral-600 hover:border-gather-brown-mid hover:text-gather-brown"
      : "border border-neutral-200/80 bg-white font-semibold text-gather-ink shadow-sm ring-1 ring-black/[0.02] hover:border-gather-accent/40 hover:shadow-md";
  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}
