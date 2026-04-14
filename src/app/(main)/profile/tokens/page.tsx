import Link from "next/link";
import { TokenExplainer } from "@/components/token-explainer";
import { purchaseTokensStub } from "@/app/actions/tokens";

export default function BuyTokensPage() {
  return (
    <div className="pb-28">
      <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-gather-brown hover:underline">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" /></svg>
        Back
      </Link>
      <h1 className="mt-4 text-xl font-semibold">Buy tokens</h1>
      <TokenExplainer className="mt-4" />
      <p className="mt-4 text-sm text-neutral-600">
        Pricing: 1 token = $10 · 3 tokens = $26. Checkout runs through Stripe
        (wire up keys next).
      </p>
      <div className="mt-8 space-y-4">
        <form action={purchaseTokensStub}>
          <input type="hidden" name="pack" value={1} />
          <button
            type="submit"
            className="w-full rounded-full border border-gather-brown py-3 text-sm font-medium text-gather-brown"
          >
            Buy 1 token ($10) — stub
          </button>
        </form>
        <form action={purchaseTokensStub}>
          <input type="hidden" name="pack" value={3} />
          <button
            type="submit"
            className="w-full rounded-full bg-gather-brown py-3 text-sm font-medium text-gather-cream"
          >
            Buy 3 tokens ($26) — stub
          </button>
        </form>
      </div>
    </div>
  );
}
