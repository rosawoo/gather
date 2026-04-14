import Link from "next/link";
import { TokenExplainer } from "@/components/token-explainer";
import { purchaseTokensStub } from "@/app/actions/tokens";

export default function BuyTokensPage() {
  return (
    <div className="pb-28">
      <Link href="/profile" className="text-sm text-gather-brown hover:underline">
        ← Back
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
