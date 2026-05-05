import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key?.startsWith("sk_")) {
      throw new Error(
        "STRIPE_SECRET_KEY is missing or invalid — use your dashboard secret key (sk_test_… or sk_live_…).",
      );
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.startsWith("sk_"));
}
