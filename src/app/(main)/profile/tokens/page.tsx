import Link from "next/link";
import { TokenExplainer } from "@/components/token-explainer";
import { purchaseTokensStub } from "@/app/actions/tokens";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";

type Pack = {
  pack: 1 | 3;
  tokens: number;
  price: string;
  perToken: string;
  tag?: string;
  highlight?: boolean;
};

const PACKS: Pack[] = [
  { pack: 1, tokens: 1, price: "$10", perToken: "$10 per token" },
  {
    pack: 3,
    tokens: 3,
    price: "$26",
    perToken: "~$8.67 per token",
    tag: "Best value",
    highlight: true,
  },
];

export default function BuyTokensPage() {
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

      <div className="rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm ring-1 ring-black/[0.02]">
        <TokenExplainer />
      </div>

      <section className="mt-8">
        <SectionTitle title="Packs" />
        <div className="space-y-3">
          {PACKS.map((p) => (
            <form key={p.pack} action={purchaseTokensStub}>
              <input type="hidden" name="pack" value={p.pack} />
              <button
                type="submit"
                className={`group flex w-full items-center justify-between rounded-2xl border p-4 text-left shadow-sm transition ${
                  p.highlight
                    ? "border-gather-accent/40 bg-white ring-1 ring-gather-accent/10 hover:border-gather-accent hover:shadow-md"
                    : "border-neutral-200/80 bg-white ring-1 ring-black/[0.02] hover:border-gather-accent/40 hover:shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-2xl font-light text-gather-ink">
                      {p.tokens}
                    </span>
                    <span className="text-sm font-medium text-gather-ink">
                      token{p.tokens === 1 ? "" : "s"}
                    </span>
                    {p.tag ? (
                      <span className="rounded-full bg-gather-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gather-brown-mid">
                        {p.tag}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">{p.perToken}</p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-2xl font-light text-gather-brown">
                    {p.price}
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gather-brown-mid transition group-hover:text-gather-brown">
                    Buy →
                  </p>
                </div>
              </button>
            </form>
          ))}
        </div>

        <p className="mt-4 text-xs text-neutral-500">
          Checkout runs through Stripe. Payments fund host reimbursements
          (Venmo or bank transfer).
        </p>
      </section>
    </div>
  );
}
