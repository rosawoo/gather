import Link from "next/link";
import { signInWithGoogle } from "@/app/actions/auth";

type Mode = "sign-in" | "sign-up";

const COPY: Record<
  Mode,
  {
    eyebrow: string;
    title: string;
    sub: string;
    cta: string;
    switchLabel: string;
    switchHref: string;
    switchCta: string;
  }
> = {
  "sign-in": {
    eyebrow: "Welcome back",
    title: "Sign in",
    sub: "Pick up where you left off: browse gatherings and RSVP.",
    cta: "Continue with Google",
    switchLabel: "New to Gather?",
    switchHref: "/sign-up",
    switchCta: "Create an account",
  },
  "sign-up": {
    eyebrow: "Say hello",
    title: "Create account",
    sub: "It takes a minute. After Google, you'll set up your profile.",
    cta: "Sign up with Google",
    switchLabel: "Already have an account?",
    switchHref: "/sign-in",
    switchCta: "Sign in",
  },
};

export function AuthPanel({
  mode,
  callbackUrl,
}: {
  mode: Mode;
  callbackUrl: string;
}) {
  const copy = COPY[mode];
  const tabBase =
    "flex-1 rounded-full px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] transition";
  const active = "bg-gather-wine text-gather-cream shadow-sm";
  const inactive =
    "text-gather-charcoal hover:bg-gather-teal/10 hover:text-gather-teal";

  return (
    <div className="mx-auto flex w-full flex-1 flex-col">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-gather-teal transition hover:text-gather-wine"
      >
        <span aria-hidden>←</span> Back
      </Link>

      <div className="mt-10 flex flex-1 flex-col justify-center sm:mt-6">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gather-teal">
          <span
            className="h-1 w-4 rounded-full bg-gather-accent/90"
            aria-hidden
          />
          {copy.eyebrow}
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-gather-ink sm:text-4xl">
          {copy.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gather-charcoal">
          {copy.sub}
        </p>

        <div
          role="tablist"
          aria-label="Authentication"
          className="mt-8 flex gap-1 rounded-full border border-gather-teal bg-white/50 p-1"
        >
          <Link
            href="/sign-in"
            role="tab"
            aria-selected={mode === "sign-in"}
            className={`${tabBase} ${mode === "sign-in" ? active : inactive}`}
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            role="tab"
            aria-selected={mode === "sign-up"}
            className={`${tabBase} ${mode === "sign-up" ? active : inactive}`}
          >
            Sign up
          </Link>
        </div>

        <form action={signInWithGoogle} className="mt-6">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <button
            type="submit"
            className="group flex w-full items-center justify-center gap-3 border border-gather-teal bg-white px-6 py-3.5 text-sm font-semibold text-gather-ink shadow-sm transition hover:bg-gather-cream hover:shadow-md active:scale-[0.99]"
          >
            <GoogleMark className="h-5 w-5 shrink-0" aria-hidden />
            {copy.cta}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gather-charcoal">
          {copy.switchLabel}{" "}
          <Link
            href={copy.switchHref}
            className="font-semibold text-gather-teal underline decoration-gather-teal/50 underline-offset-4 transition hover:text-gather-wine hover:decoration-gather-wine"
          >
            {copy.switchCta}
          </Link>
        </p>

        <p className="mt-10 text-center text-xs leading-relaxed text-gather-charcoal/70">
          By continuing, Google may share your name, email, and profile photo
          with Gather. You agree to our community guidelines.
        </p>
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
