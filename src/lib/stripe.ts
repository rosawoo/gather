import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY?.trim();
    if (!key?.startsWith("sk_")) {
      throw new Error(
        "STRIPE_SECRET_KEY is missing or invalid. Use your dashboard secret key (sk_test_… or sk_live_…).",
      );
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  return Boolean(key?.startsWith("sk_"));
}
