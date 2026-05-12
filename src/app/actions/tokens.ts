"use server";

import { auth } from "@/auth";
import { getSiteUrl } from "@/lib/site-url";
import { getStripe } from "@/lib/stripe";
import {
  effectiveCheckoutAmountCents,
  getTokenPack,
} from "@/lib/token-packs";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

// Tokens are credited when Stripe sends `checkout.session.completed` to /api/stripe/webhook.
export async function purchaseTokensCheckout(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const pack = Number(formData.get("pack") ?? 0);
  const def = getTokenPack(pack);
  if (!def) {
    throw new Error("Invalid pack");
  }

  const stripe = getStripe();
  const site = getSiteUrl();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, stripeCustomerId: true },
  });
  if (!user) {
    throw new Error("User not found");
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${def.tokens} Gather token${def.tokens === 1 ? "" : "s"}`,
            description: def.description,
          },
          unit_amount: effectiveCheckoutAmountCents(def.amountCents),
        },
        quantity: 1,
      },
    ],
    success_url: `${site}/profile/tokens?checkout=success`,
    cancel_url: `${site}/profile/tokens?checkout=cancelled`,
    client_reference_id: session.user.id,
    metadata: {
      userId: session.user.id,
      tokens: String(def.tokens),
      pack: String(def.pack),
    },
    ...(user.stripeCustomerId
      ? { customer: user.stripeCustomerId }
      : {
          customer_email: user.email ?? undefined,
          customer_creation: "always" as const,
        }),
  });

  if (!checkoutSession.url) {
    throw new Error("Stripe Checkout did not return a URL");
  }

  redirect(checkoutSession.url);
}
