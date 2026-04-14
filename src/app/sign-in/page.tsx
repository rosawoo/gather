import { auth } from "@/auth";
import { signInWithGoogle } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { nextAppPath } from "@/lib/onboarding";
import Link from "next/link";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

function normalizeCallback(raw: string | undefined): string {
  if (typeof raw !== "string") return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  if (raw.includes("://") || raw.includes("..")) return "/";
  return raw;
}

export default async function SignInPage({ searchParams }: Props) {
  const session = await auth();
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });
    if (user) redirect(nextAppPath(user));
  }

  const sp = await searchParams;
  const callbackUrl = normalizeCallback(sp.callbackUrl);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-gather-brown px-6 py-12 text-gather-cream sm:py-16">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <Link
          href="/"
          className="text-sm text-gather-cream/70 transition hover:text-gather-cream"
        >
          ← Back
        </Link>

        <div className="mt-10 flex flex-1 flex-col justify-center sm:mt-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gather-cream/60">
            Gather
          </p>
          <h1 className="mt-3 font-serif text-4xl font-light tracking-tight sm:text-5xl">
            Sign in
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-gather-cream/80">
            Use your Google account. New here? You&apos;ll set up your profile
            right after the first sign-in.
          </p>

          <form action={signInWithGoogle} className="mt-10">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-full bg-gather-cream px-6 py-3.5 text-sm font-semibold text-gather-brown shadow-md transition hover:bg-white"
            >
              <GoogleMark className="h-5 w-5 shrink-0" aria-hidden />
              Continue with Google
            </button>
          </form>

          <p className="mt-8 text-center text-xs leading-relaxed text-gather-cream/55">
            By continuing, Google may share your name, email address, and
            profile photo with Gather according to its privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
