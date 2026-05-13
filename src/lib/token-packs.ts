export type TokenPackId = 1 | 3 | 99;

export type TokenPack = {
  pack: TokenPackId;
  tokens: number;
  amountCents: number;
  priceLabel: string;
  perTokenLabel: string;
  description: string;
  tag?: string;
  highlight?: boolean;
};

/** Optional test override: cents charged at Checkout for every pack (catalog prices unchanged). */
function parseStripeOverrideAmountCents(): number | null {
  const raw = process.env.STRIPE_OVERRIDE_AMOUNT_CENTS?.trim();
  if (!raw || !/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.min(Math.floor(n), 9_999_999);
}

/** Amount sent to Stripe Checkout `unit_amount` (integer cents USD). */
export function effectiveCheckoutAmountCents(catalogAmountCents: number): number {
  return parseStripeOverrideAmountCents() ?? catalogAmountCents;
}

export function isStripeCheckoutAmountOverridden(): boolean {
  return parseStripeOverrideAmountCents() !== null;
}

/** Price shown on /profile/tokens (matches Checkout when overridden). */
export function displayPackPriceLabel(pack: TokenPack): string {
  const o = parseStripeOverrideAmountCents();
  if (o == null) return pack.priceLabel;
  return `$${(o / 100).toFixed(2)}`;
}

/** Subline under packs on /profile/tokens when overridden. */
export function displayPackPerTokenLine(pack: TokenPack): string {
  if (!isStripeCheckoutAmountOverridden()) return pack.perTokenLabel;
  return `Test checkout — grants ${pack.tokens} token${pack.tokens === 1 ? "" : "s"}`;
}

/** $0.01 Checkout for local / explicit test environments (pack id 99). */
const STRIPE_TEST_ONE_CENT_PACK: TokenPack = {
  pack: 99,
  tokens: 1,
  amountCents: 1,
  priceLabel: "$0.01",
  perTokenLabel: "$0.01 · 1 token (test only)",
  description: "End-to-end Stripe test: minimal USD charge, 1 token credited on webhook",
  tag: "Test",
};

/**
 * Shows the 1¢ pack on /profile/tokens when:
 * - `ENABLE_STRIPE_TEST_PACK=true` (or `1` / `yes`), or
 * - `NODE_ENV===development` unless `ENABLE_STRIPE_TEST_PACK=false` / `0`.
 */
export function isStripeTestOneCentPackEnabled(): boolean {
  const v = process.env.ENABLE_STRIPE_TEST_PACK?.trim().toLowerCase();
  if (v === "false" || v === "0") return false;
  if (v === "true" || v === "1" || v === "yes") return true;
  return process.env.NODE_ENV === "development";
}

export const TOKEN_PACKS: readonly TokenPack[] = [
  {
    pack: 1,
    tokens: 1,
    amountCents: 1000,
    priceLabel: "$10",
    perTokenLabel: "$10 per token",
    description: "1 Gather token, shared costs for gatherings",
  },
  {
    pack: 3,
    tokens: 3,
    amountCents: 2600,
    priceLabel: "$26",
    perTokenLabel: "~$8.67 per token",
    description: "3 Gather tokens, shared costs for gatherings",
    tag: "Best value",
    highlight: true,
  },
];

/** Packs rendered on Buy tokens (includes 1¢ test pack when enabled). */
export function tokenPacksForListing(): readonly TokenPack[] {
  if (isStripeTestOneCentPackEnabled()) {
    return [...TOKEN_PACKS, STRIPE_TEST_ONE_CENT_PACK];
  }
  return TOKEN_PACKS;
}

export function getTokenPack(pack: number): TokenPack | undefined {
  if (
    isStripeTestOneCentPackEnabled() &&
    pack === STRIPE_TEST_ONE_CENT_PACK.pack
  ) {
    return STRIPE_TEST_ONE_CENT_PACK;
  }
  return TOKEN_PACKS.find((p) => p.pack === pack);
}
