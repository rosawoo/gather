import Link from "next/link";
import { signInWithGoogle } from "@/app/actions/auth";

type Mode = "sign-in" | "sign-up";

type Variant = "default" | "candlelit";

const COPY: Record<
  Mode,
  {
    eyebrow: string;
    title: string;
    sub: string;
    cta: string;
    switchLabel: string;
    switchCta: string;
  }
> = {
  "sign-in": {
    eyebrow: "Welcome back",
    title: "Sign in",
    sub: "Pick up where you left off: browse gatherings and RSVP.",
    cta: "Continue with Google",
    switchLabel: "New to Gather?",
    switchCta: "Create an account",
  },
  "sign-up": {
    eyebrow: "Say hello",
    title: "Create account",
    sub: "It takes a minute. After Google, you'll set up your profile.",
    cta: "Sign up with Google",
    switchLabel: "Already have an account?",
    switchCta: "Sign in",
  },
};

const CANDLELIT_COPY: Record<
  Mode,
  {
    eyebrow: string;
    title: string;
    sub: string;
    cta: string;
    switchLabel: string;
    switchCta: string;
  }
> = {
  "sign-in": {
    eyebrow: "welcome back",
    title: "sign in",
    sub: "pick up where you left off—browse gatherings, send requests, host when you are ready.",
    cta: "continue with google",
    switchLabel: "new here?",
    switchCta: "create an account",
  },
  "sign-up": {
    eyebrow: "come on in",
    title: "join gather",
    sub: "one tap with google, then a short profile so hosts know who you are.",
    cta: "sign up with google",
    switchLabel: "already gathering?",
    switchCta: "sign in",
  },
};

export function AuthPanel({
  mode,
  callbackUrl,
  variant = "default",
  showBackLink = true,
}: {
  mode: Mode;
  callbackUrl: string;
  variant?: Variant;
  /** Hide the back/home link when this panel is already the home welcome screen (`/`). */
  showBackLink?: boolean;
}) {
  const copy = variant === "candlelit" ? CANDLELIT_COPY[mode] : COPY[mode];

  const tabBase =
    "flex-1 rounded-full px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] transition";

  const defaultActive = "bg-gather-wine text-gather-cream shadow-sm";
  const defaultInactive =
    "text-gather-charcoal hover:bg-gather-teal/10 hover:text-gather-teal";

  const candleActive =
    "bg-[#266b7e] text-[#f4eee7] shadow-md shadow-black/20";
  const candleInactive =
    "text-[#f4eee7]/65 hover:bg-[#321308]/80 hover:text-[#f4eee7]";

  const active = variant === "candlelit" ? candleActive : defaultActive;
  const inactive = variant === "candlelit" ? candleInactive : defaultInactive;

  const signInTabHref = `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  const signUpTabHref = `/?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  const backClass =
    variant === "candlelit"
      ? "inline-flex w-fit items-center gap-1.5 text-sm font-medium text-[#c6d8e3] transition hover:text-[#f4eee7]"
      : "inline-flex w-fit items-center gap-1.5 text-sm font-medium text-gather-teal transition hover:text-gather-wine";

  const eyebrowClass =
    variant === "candlelit"
      ? "flex items-center gap-2 text-[11px] font-semibold lowercase tracking-[0.18em] text-[#a98974]"
      : "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gather-teal";

  const eyebrowDot =
    variant === "candlelit"
      ? "h-1 w-4 rounded-full bg-[#c6d8e3]/70"
      : "h-1 w-4 rounded-full bg-gather-accent/90";

  const titleClass =
    variant === "candlelit"
      ? "landing-font-display mt-3 text-3xl font-normal tracking-tight text-[#f4eee7] sm:text-[2.15rem]"
      : "mt-3 font-display text-3xl font-bold tracking-tight text-gather-ink sm:text-4xl";

  const subClass =
    variant === "candlelit"
      ? "mt-3 text-[1.02rem] leading-relaxed text-[#eee9e1]/88"
      : "mt-3 text-sm leading-relaxed text-gather-charcoal";

  const tabShellClass =
    variant === "candlelit"
      ? "mt-8 flex gap-1 rounded-full border border-[#c6d8e3]/35 bg-[#1a0702]/45 p-1"
      : "mt-8 flex gap-1 rounded-full border border-gather-teal bg-white/50 p-1";

  const googleBtnClass =
    variant === "candlelit"
      ? "group flex w-full items-center justify-center gap-3 border border-[#321308] bg-[#eee9e1] px-6 py-3.5 text-base font-semibold text-[#3a1a0f] shadow-lg shadow-black/25 transition hover:bg-[#f4eee7] active:scale-[0.99]"
      : "group flex w-full items-center justify-center gap-3 border border-gather-teal bg-white px-6 py-3.5 text-sm font-semibold text-gather-ink shadow-sm transition hover:bg-gather-cream hover:shadow-md active:scale-[0.99]";

  const switchClass =
    variant === "candlelit"
      ? "mt-6 text-center text-[1rem] text-[#eee9e1]/82"
      : "mt-6 text-center text-sm text-gather-charcoal";

  const switchLinkClass =
    variant === "candlelit"
      ? "font-semibold text-[#c6d8e3] underline decoration-[#c6d8e3]/45 underline-offset-4 transition hover:text-[#f4eee7] hover:decoration-[#f4eee7]"
      : "font-semibold text-gather-teal underline decoration-gather-teal/50 underline-offset-4 transition hover:text-gather-wine hover:decoration-gather-wine";

  const legalClass =
    variant === "candlelit"
      ? "mt-10 text-center text-xs leading-relaxed text-[#a98974]/85"
      : "mt-10 text-center text-xs leading-relaxed text-gather-charcoal/70";

  const showLowercaseTabs = variant === "candlelit";

  const contentTop =
    variant === "candlelit"
      ? showBackLink
        ? "mt-8 sm:mt-6"
        : "mt-0"
      : showBackLink
        ? "mt-10"
        : "mt-0";

  return (
    <div className="mx-auto flex w-full flex-1 flex-col">
      {showBackLink ? (
        <Link href="/" className={backClass}>
          <span aria-hidden>←</span> {variant === "candlelit" ? "home" : "Back"}
        </Link>
      ) : null}

      <div className={`${contentTop} flex flex-1 flex-col justify-center`}>
        <p className={eyebrowClass}>
          <span className={eyebrowDot} aria-hidden />
          {copy.eyebrow}
        </p>
        <h1 className={titleClass}>{copy.title}</h1>
        <p className={subClass}>{copy.sub}</p>

        <div role="tablist" aria-label="Authentication" className={tabShellClass}>
          <Link
            href={signInTabHref}
            role="tab"
            aria-selected={mode === "sign-in"}
            className={`${tabBase} ${mode === "sign-in" ? active : inactive}`}
            style={
              showLowercaseTabs
                ? { textTransform: "lowercase" as const }
                : undefined
            }
          >
            {showLowercaseTabs ? "sign in" : "Sign in"}
          </Link>
          <Link
            href={signUpTabHref}
            role="tab"
            aria-selected={mode === "sign-up"}
            className={`${tabBase} ${mode === "sign-up" ? active : inactive}`}
            style={
              showLowercaseTabs
                ? { textTransform: "lowercase" as const }
                : undefined
            }
          >
            {showLowercaseTabs ? "sign up" : "Sign up"}
          </Link>
        </div>

        <form action={signInWithGoogle} className="mt-6">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <button type="submit" className={googleBtnClass}>
            <GoogleMark className="h-5 w-5 shrink-0" aria-hidden />
            {copy.cta}
          </button>
        </form>

        <p className={switchClass}>
          {copy.switchLabel}{" "}
          <Link href={mode === "sign-in" ? signUpTabHref : signInTabHref} className={switchLinkClass}>
            {copy.switchCta}
          </Link>
        </p>

        {variant === "candlelit" ? (
          <p className={legalClass}>
            by continuing, google may share your name, email, and photo with
            gather. you agree to our{" "}
            <Link
              href="/terms-of-service"
              className="text-[#c6d8e3] underline-offset-2 hover:underline"
            >
              terms
            </Link>
            ,{" "}
            <Link
              href="/privacy-policy"
              className="text-[#c6d8e3] underline-offset-2 hover:underline"
            >
              privacy policy
            </Link>
            , and{" "}
            <Link
              href="/community-guidelines"
              className="text-[#c6d8e3] underline-offset-2 hover:underline"
            >
              community guidelines
            </Link>
            .
          </p>
        ) : (
          <p className={legalClass}>
            By continuing, Google may share your name, email, and profile photo
            with Gather. You agree to our community guidelines.
          </p>
        )}
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
