import Link from "next/link";
import { purchaseTokensCheckout } from "@/app/actions/tokens";
import {
  displayPackPerTokenLine,
  displayPackPriceLabel,
  isStripeCheckoutAmountOverridden,
  isStripeTestOneCentPackEnabled,
  tokenPacksForListing,
  type TokenPack,
} from "@/lib/token-packs";
import { isStripeConfigured } from "@/lib/stripe";
import { TokenExplainer } from "@/components/token-explainer";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";

/** Read Stripe env at request time (Vercel env after deploy, not build-only cache). */
export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{ checkout?: string | string[] }>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/** Parchment product surface (warm paper on espresso shell). */
const parchmentSurface =
  "rounded-2xl border border-[rgb(55_40_35_/_0.12)] bg-lc-settings-parchment-soft shadow-[inset_0_1px_0_rgb(255_255_255_/_0.5),0_12px_42px_-22px_rgb(18_8_4_/_0.65)] ring-1 ring-white/20";

function TokenPackOffer({
  pack: p,
  stripeOk,
}: {
  pack: TokenPack;
  stripeOk: boolean;
}) {
  const outerRing =
    p.pack === 99
      ? "ring-amber-400/45 focus-visible:ring-amber-300/65"
      : p.highlight
        ? "ring-gather-brown/35 focus-visible:ring-gather-brown/55"
        : "ring-lc-muted-tan/25 focus-visible:ring-lc-muted-tan/45";

  const inner = (
    <div className={`${parchmentSurface} px-5 py-4 transition`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-serif text-2xl font-light tabular-nums text-lc-settings-ink-strong sm:text-[1.625rem]">
              {p.tokens}
            </span>
            <span className="text-[15px] font-semibold tracking-wide text-lc-settings-label">
              token{p.tokens === 1 ? "" : "s"}
            </span>
            {p.tag ? (
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                  p.pack === 99
                    ? "bg-amber-500/20 text-amber-950 ring-1 ring-amber-800/35"
                    : "bg-gather-brown/12 text-gather-brown"
                }`}
              >
                {p.tag}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-[15px] leading-snug text-lc-settings-helper">
            {displayPackPerTokenLine(p)}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:shrink-0 sm:items-end sm:text-right">
          <p className="font-serif text-[1.6rem] font-light tabular-nums text-gather-brown sm:text-[1.75rem]">
            {displayPackPriceLabel(p)}
          </p>
          <span
            className={`inline-flex w-full items-center justify-center rounded-full border px-5 py-2.5 text-[15px] font-semibold transition sm:w-auto sm:min-w-[8.75rem] ${
              stripeOk
                ? "border-gather-brown bg-gather-brown text-gather-cream group-hover:bg-gather-brown-mid group-active:scale-[0.99]"
                : "border-lc-muted-tan/45 text-lc-settings-label opacity-[0.62]"
            }`}
          >
            {stripeOk ? "Purchase with card" : "Unavailable"}
          </span>
        </div>
      </div>
    </div>
  );

  const buttonClass = `group relative block w-full max-w-xl rounded-2xl text-left outline-none ring-2 ring-transparent ring-offset-2 ring-offset-lc-bg-void transition hover:brightness-[1.02] focus-visible:ring-gather-accent disabled:pointer-events-none disabled:opacity-55 ${outerRing}`;

  if (stripeOk) {
    return (
      <form action={purchaseTokensCheckout} className="mx-auto block w-full max-w-xl">
        <input type="hidden" name="pack" value={p.pack} />
        <button type="submit" className={buttonClass}>
          {inner}
        </button>
      </form>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className={buttonClass}>{inner}</div>
    </div>
  );
}

export default async function BuyTokensPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const checkoutStatus = firstParam(sp.checkout);
  const stripeOk = isStripeConfigured();
  const stripeTestCharge = isStripeCheckoutAmountOverridden();
  const showOneCentPack = isStripeTestOneCentPackEnabled();

  const mutedFootnote =
    "text-[14px] leading-relaxed text-lc-caption-warm/82 sm:text-[15px]";
  const statusBannerBase =
    "rounded-2xl border px-4 py-3.5 text-[14px] leading-relaxed sm:text-[15px]";

  return (
    <div className="mx-auto max-w-2xl pb-24">
      <nav aria-label="Breadcrumb" className={`${mutedFootnote} mb-6`}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li>
            <Link
              href="/profile"
              className="font-medium text-lc-caption-warm underline decoration-from-font decoration-lc-caption-warm/45 underline-offset-[5px] transition hover:text-lc-cream hover:decoration-lc-cream/55"
            >
              Profile
            </Link>
          </li>
          <li className="text-lc-earth-muted/80" aria-hidden>
            /
          </li>
          <li aria-current="page" className="font-semibold text-lc-cream/96">
            Buy tokens
          </li>
        </ol>
      </nav>

      <PageHeader variant="espresso" title="Buy tokens" className="mb-10" />

      {checkoutStatus === "success" ? (
        <p
          className={`${statusBannerBase} mb-8 border-emerald-800/35 bg-emerald-950/[0.22] text-lc-caption-warm`}
          role="status"
        >
          Checkout completed. Your tokens will appear once payment is confirmed (usually within a few
          seconds).
        </p>
      ) : checkoutStatus === "cancelled" ? (
        <p
          className={`${statusBannerBase} mb-8 border-lc-muted-tan/35 bg-black/25 text-lc-caption-warm/95`}
          role="status"
        >
          Checkout was cancelled. You have not been charged.
        </p>
      ) : null}

      <div className={`${parchmentSurface} px-5 py-6 sm:px-7 sm:py-8`}>
        <TokenExplainer className="max-w-xl text-[15px] leading-[1.58] text-lc-settings-ink-strong sm:text-base sm:leading-[1.56]" />
      </div>

      {!stripeOk ? (
        <p
          className={`${mutedFootnote} mt-8 rounded-xl border border-lc-pale-blue-border/25 bg-lc-chip-surface px-4 py-3.5 text-lc-caption-warm/94`}
          role="status"
        >
          Checkout needs{" "}
          <code className="rounded-md bg-black/35 px-1.5 py-0.5 font-mono text-[13px] text-lc-cream/95">
            STRIPE_SECRET_KEY
          </code>{" "}
          in this environment (e.g. Vercel → Project → Settings → Environment Variables →{" "}
          <strong className="font-medium text-lc-cream/95">Production</strong>, then redeploy). Add{" "}
          <code className="rounded-md bg-black/35 px-1.5 py-0.5 font-mono text-[13px] text-lc-cream/95">
            STRIPE_WEBHOOK_SECRET
          </code>{" "}
          too so paid checkouts can credit tokens via{" "}
          <code className="rounded bg-black/30 px-1 font-mono text-[13px] text-lc-cream/92">
            /api/stripe/webhook
          </code>
          . See <code className="font-mono text-[13px] text-lc-cream/92">.env.example</code>.
        </p>
      ) : null}

      {stripeOk && showOneCentPack && !stripeTestCharge ? (
        <p
          className={`mt-8 ${statusBannerBase} border-amber-300/42 bg-black/34 text-[14px] text-amber-100/94 sm:text-[15px]`}
          role="status"
        >
          <span className="font-semibold">1¢ test pack is available.</span> Shown automatically in{" "}
          <code className="rounded bg-black/38 px-1.5 py-0.5 font-mono text-xs text-amber-50">
            development
          </code>{" "}
          or when{" "}
          <code className="rounded bg-black/38 px-1.5 py-0.5 font-mono text-xs text-amber-50">
            ENABLE_STRIPE_TEST_PACK=true
          </code>{" "}
          — use Stripe test cards. Hide with{" "}
          <code className="rounded bg-black/38 px-1 py-0.5 font-mono text-xs text-amber-50">
            ENABLE_STRIPE_TEST_PACK=false
          </code>{" "}
          locally if you prefer.
        </p>
      ) : null}

      {stripeOk && stripeTestCharge ? (
        <p
          className={`mt-8 ${statusBannerBase} border-amber-200/48 bg-black/38 text-[14px] text-amber-100/98 sm:text-[15px]`}
          role="status"
        >
          <span className="font-semibold">Test checkout pricing.</span>{" "}
          <code className="rounded bg-black/38 px-1.5 py-0.5 font-mono text-xs text-amber-50">
            STRIPE_OVERRIDE_AMOUNT_CENTS
          </code>{" "}
          is set; every pack charges that many cents at Stripe regardless of list price. Remove it in
          production.
        </p>
      ) : null}

      <section className={!stripeOk ? "mt-10 opacity-[0.9]" : "mt-11"}>
        <SectionTitle title="Token packs" variant="hostShell" className="mb-5 max-w-xl" />

        <div className="space-y-5">
          {tokenPacksForListing().map((p) => (
            <TokenPackOffer key={p.pack} pack={p} stripeOk={stripeOk} />
          ))}
        </div>

        <p className={`mx-auto mt-8 mb-10 max-w-xl border-t border-white/[0.08] pt-6 ${mutedFootnote} text-[13px] text-lc-earth-muted`}>
          Need help? Visit{" "}
          <Link
            href="/profile/settings"
            className="font-medium text-lc-caption-warm/95 underline decoration-from-font underline-offset-4 hover:text-lc-cream"
          >
            Settings
          </Link>{" "}
          or reach out via your Gather notifications.
        </p>
      </section>
    </div>
  );
}
