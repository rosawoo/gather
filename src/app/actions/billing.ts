"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { redirect } from "next/navigation";

/** Stripe Customer Portal. Configure products/proration in the Stripe Dashboard. */
export async function billingPortalRedirect() {
  if (!isStripeConfigured()) {
    throw new Error("Stripe is not configured");
  }

  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    throw new Error(
      "No billing account yet. Buy tokens once with card checkout to open the portal.",
    );
  }

  const stripe = getStripe();
  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${getSiteUrl()}/profile/settings`,
  });

  if (!portal.url) throw new Error("Stripe did not return a portal URL");
  redirect(portal.url);
}