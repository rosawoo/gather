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
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-gather-brown px-6 py-16 text-gather-cream">
      <h1 className="font-serif text-5xl font-light tracking-[0.2em] sm:text-6xl">
        Gather
      </h1>
      <p className="mt-6 max-w-sm text-center text-sm leading-relaxed text-gather-cream/80">
        A cozier way to meet people. Sign in to browse gatherings.
      </p>
      <div className="mt-14 flex w-full max-w-xs flex-col gap-4">
        <Link
          href="/sign-in"
          className="block w-full rounded-full bg-gather-cream px-6 py-3.5 text-center text-sm font-medium text-gather-brown transition hover:bg-white"
        >
          Sign in
        </Link>
        <Link
          href="/sign-in"
          className="block w-full rounded-full border border-gather-cream/40 bg-transparent px-6 py-3.5 text-center text-sm font-medium text-gather-cream transition hover:border-gather-cream hover:bg-gather-brown-mid/50"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
