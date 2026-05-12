import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { nextAppPath } from "@/lib/onboarding";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });
    if (user) redirect(nextAppPath(user));
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center overflow-hidden bg-gather-espresso px-6 py-16 text-gather-cream">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 15%, rgba(196,165,116,0.55), transparent 55%), radial-gradient(circle at 85% 85%, rgba(244,235,228,0.35), transparent 50%)",
        }}
      />

      <div className="relative flex flex-col items-center">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-gather-cream/60">
          <span
            className="h-1 w-4 rounded-full bg-gather-accent/90"
            aria-hidden
          />
          est. around the table
        </p>
        <h1 className="mt-4 font-serif text-5xl font-light tracking-[0.22em] sm:text-6xl">
          Gather
        </h1>
        <p className="mt-6 max-w-sm text-center text-sm leading-relaxed text-gather-cream/75">
          A cozier way to meet people. Small gatherings, real rooms, in your
          neighborhood.
        </p>
      </div>

      <div className="relative mt-14 flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/sign-in"
          className="block w-full rounded-full bg-gather-cream px-6 py-3.5 text-center text-sm font-semibold text-gather-brown shadow-md transition hover:bg-white hover:shadow-lg active:scale-[0.99]"
        >
          Log In
        </Link>
        <Link
          href="/sign-up"
          className="block w-full rounded-full border border-gather-cream/35 bg-transparent px-6 py-3.5 text-center text-sm font-medium text-gather-cream transition hover:border-gather-cream hover:bg-gather-brown-mid/50"
        >
          Create Account
        </Link>
      </div>

      <p className="relative mt-10 text-center text-xs text-gather-cream/50">
        Free to join. Invite-first beta.
      </p>
    </div>
  );
}
