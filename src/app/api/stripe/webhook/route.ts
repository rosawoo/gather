import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { TokenLedgerType } from "@prisma/client";

export const runtime = "nodejs";

async function fulfillCheckoutSession(session: Stripe.Checkout.Session): Promise<void> {
  if (session.payment_status !== "paid") {
    return;
  }

  if (session.mode !== "payment") {
    return;
  }

  const userId = session.metadata?.userId;
  const tokensRaw = session.metadata?.tokens;
  if (!userId || tokensRaw === undefined || tokensRaw === "") {
    console.error(`[stripe] Missing checkout metadata for session ${session.id}`);
    return;
  }

  const tokens = parseInt(tokensRaw, 10);
  if (!Number.isFinite(tokens) || tokens < 1) {
    console.error(`[stripe] Invalid token count for session ${session.id}`);
    return;
  }

  await prisma.$transaction(async (tx) => {
    const existing = await tx.stripeTokenPurchase.findUnique({
      where: { stripeCheckoutSessionId: session.id },
    });
    if (existing) {
      return;
    }

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      console.error(
        `[stripe] User ${userId} not found; skipping fulfillment for session ${session.id}`,
      );
      return;
    }

    await tx.stripeTokenPurchase.create({
      data: {
        stripeCheckoutSessionId: session.id,
        userId,
        tokenCount: tokens,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: { tokensAvailable: { increment: tokens } },
    });

    await tx.tokenLedgerEntry.create({
      data: {
        userId,
        delta: tokens,
        type: TokenLedgerType.GRANT,
        note: `Stripe purchase (${session.id})`,
      },
    });
  });
}

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET not configured" },
      { status: 500 },
    );
  }

  const rawBody = await req.text();
  const headerList = await headers();
  const signature = headerList.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[stripe webhook] signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      await fulfillCheckoutSession(session);
    } catch (err) {
      console.error("[stripe webhook] fulfillment error:", err);
      return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
