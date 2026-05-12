import Link from "next/link";
import { purchaseTokensCheckout } from "@/app/actions/tokens";

/** Read Stripe env at request time (Vercel env after deploy, not build-only cache). */
export const dynamic = "force-dynamic";
import type { TokenPack } from "@/lib/token-packs";
import { TOKEN_PACKS } from "@/lib/token-packs";
import { isStripeConfigured } from "@/lib/stripe";
import { TokenExplainer } from "@/components/token-explainer";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";

type Props = {
  searchParams?: Promise<{ checkout?: string | string[] }>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function TokenPackOffer({
  pack: p,
  stripeOk,
}: {
  pack: TokenPack;
  stripeOk: boolean;
}) {
  const shellClass = `group flex w-full items-center justify-between rounded-2xl border p-4 text-left shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
    p.highlight
      ? "border-gather-accent/40 bg-white ring-1 ring-gather-accent/10 enabled:hover:border-gather-accent enabled:hover:shadow-md"
      : "border-gather-teal/25 bg-white ring-1 ring-gather-teal/10 enabled:hover:border-gather-accent/40 enabled:hover:shadow-md"
  }`;

  const inner = (
    <>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-serif text-2xl font-light text-gather-ink">{p.tokens}</span>
          <span className="text-sm font-medium text-gather-ink">
            token{p.tokens === 1 ? "" : "s"}
          </span>
          {p.tag ? (
            <span className="rounded-full bg-gather-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gather-brown-mid">
              {p.tag}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-gather-charcoal/80">{p.perTokenLabel}</p>
      </div>
      <div className="text-right">
        <p className="font-serif text-2xl font-light text-gather-brown">{p.priceLabel}</p>
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gather-brown-mid transition group-hover:text-gather-brown enabled:group-hover:text-gather-brown">
          Buy →
        </p>
      </div>
    </>
  );

  if (stripeOk) {
    return (
      <form action={purchaseTokensCheckout}>
        <input type="hidden" name="pack" value={p.pack} />
        <button type="submit" className={shellClass}>
          {inner}
        </button>
      </form>
    );
  }

  return (
    <div className="w-full">
      <button type="button" disabled className={`${shellClass} w-full`}>
        {inner}
      </button>
    </div>
  );
}

export default async function BuyTokensPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const checkoutStatus = firstParam(sp.checkout);
  const stripeOk = isStripeConfigured();

  return (
    <div className="pb-10">
      <Link
        href="/profile"
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
        Profile
      </Link>

      <div className="mt-5">
        <PageHeader
          title="Buy tokens"
          subtitle="Tokens cover shared costs like food, drinks, or materials."
        />
      </div>

      {checkoutStatus === "success" ? (
        <p
          className="mt-6 rounded-xl border border-emerald-200/90 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          role="status"
        >
          Checkout completed. Your tokens will appear once payment is confirmed (usually within a
          few seconds).
        </p>
      ) : checkoutStatus === "cancelled" ? (
        <p
          className="mt-6 rounded-xl border border-amber-200/90 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="status"
        >
          Checkout was cancelled. You have not been charged.
        </p>
      ) : null}

      <div className="mt-6 rounded-2xl border border-gather-teal/25 bg-white p-4 shadow-sm ring-1 ring-gather-teal/10">
        <TokenExplainer />
      </div>

      {!stripeOk ? (
        <p
          className="mt-6 rounded-xl border border-gather-teal/25 bg-gather-cream/60 px-4 py-3 text-sm text-gather-ink"
          role="status"
        >
          Checkout needs{" "}
          <code className="rounded bg-white px-1 py-0.5 text-gather-ink">
            STRIPE_SECRET_KEY
          </code>{" "}
          in this environment (e.g. Vercel → Project → Settings → Environment Variables →{" "}
          <strong className="font-medium">Production</strong>, then redeploy). Add{" "}
          <code className="rounded bg-white px-1 py-0.5 text-gather-ink">
            STRIPE_WEBHOOK_SECRET
          </code>{" "}
          too so paid checkouts can credit tokens via{" "}
          <code className="text-gather-ink">/api/stripe/webhook</code>. See{" "}
          <code className="text-gather-ink">.env.example</code>.
        </p>
      ) : null}

      <section className={!stripeOk ? "mt-8 opacity-55" : "mt-8"}>
        <SectionTitle title="Packs" />
        <div className="space-y-3">
          {TOKEN_PACKS.map((p) => (
            <TokenPackOffer key={p.pack} pack={p} stripeOk={stripeOk} />
          ))}
        </div>

        <p className="mt-4 text-xs text-gather-charcoal/80">
          Checkout runs through Stripe. Payments fund host reimbursements (Venmo or bank transfer).
        </p>
      </section>
    </div>
  );
}
