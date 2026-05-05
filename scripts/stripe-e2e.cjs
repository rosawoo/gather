#!/usr/bin/env node
/**
 * End-to-end Stripe integration check (no browser, no real card):
 * 1) prisma db push
 * 2) start Next.js on PORT (3021 — avoids colliding with a dev server on 3001)
 * 3) POST a correctly signed checkout.session.completed webhook
 * 4) assert DB: tokens increased once; duplicate event is idempotent
 *
 * Env: loads .env.local then .env via dotenv.
 * If STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET are missing, uses local-only
 * placeholders so signature verification still runs (Dashboard webhooks unaffected).
 */

const { spawn, execFileSync } = require("child_process");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { PrismaClient } = require("@prisma/client");
const Stripe = require("stripe");

const ROOT = path.join(__dirname, "..");
const PORT = 3021;
const BASE = `http://127.0.0.1:${PORT}`;
const WEBHOOK_URL = `${BASE}/api/stripe/webhook`;

const DEFAULT_SK =
  process.env.STRIPE_E2E_SECRET_KEY ||
  "sk_test_gatherE2ELocal000000000000000000000000000000000000000";
const DEFAULT_WHSEC =
  process.env.STRIPE_E2E_WEBHOOK_SECRET ||
  "whsec_gather_e2e_local_dev_only_not_for_production";

const apiKey = process.env.STRIPE_SECRET_KEY || DEFAULT_SK;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || DEFAULT_WHSEC;

const prisma = new PrismaClient();
const stripe = new Stripe(apiKey);

function log(msg) {
  process.stdout.write(`[stripe-e2e] ${msg}\n`);
}

async function waitForHttpOk(url, attempts = 90, delayMs = 600) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.status > 0 && res.status < 500) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function startDevServerOnPort(port) {
  const env = {
    ...process.env,
    PORT: String(port),
    STRIPE_SECRET_KEY: apiKey,
    STRIPE_WEBHOOK_SECRET: webhookSecret,
  };

  let resolved = false;
  let resolveReady;
  let rejectReady;
  const readyPromise = new Promise((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });

  const t = setTimeout(() => {
    if (!resolved) rejectReady(new Error("dev server did not log ready within 120s"));
  }, 120000);

  const markReady = () => {
    if (resolved) return;
    resolved = true;
    clearTimeout(t);
    resolveReady();
  };

  const marker = /Ready in|started server/i;

  const child = spawn("npx", ["next", "dev", "-p", String(port), "--webpack"], {
    cwd: ROOT,
    env,
    stdio: ["ignore", "pipe", "pipe"],
    detached: false,
  });

  const scan = (buf) => {
    if (marker.test(String(buf))) markReady();
  };

  child.stdout.on("data", scan);
  child.stderr.on("data", scan);

  child.on("exit", (code) => {
    if (!resolved && code !== 0 && code !== null) {
      clearTimeout(t);
      rejectReady(new Error(`dev server exited early: ${code}`));
    }
  });

  return { child, readyPromise };
}

async function main() {
  log("Running prisma db push…");
  execFileSync("npx", ["prisma", "db", "push", "--skip-generate"], {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
  });

  const email = "gather-stripe-e2e@local.test";
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email } });
    log(`Created test user ${user.id}`);
  } else {
    log(`Using existing test user ${user.id}`);
  }

  const sessionId = `cs_test_gather_e2e_${Date.now()}`;
  const evtId = `evt_gather_e2e_${Date.now()}`;
  const tokens = 1;

  const checkoutSession = {
    id: sessionId,
    object: "checkout.session",
    payment_status: "paid",
    mode: "payment",
    metadata: {
      userId: user.id,
      tokens: String(tokens),
      pack: "1",
    },
  };

  const payload = {
    id: evtId,
    object: "event",
    api_version: "2025-02-24.acacia",
    created: Math.floor(Date.now() / 1000),
    type: "checkout.session.completed",
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    data: {
      object: checkoutSession,
    },
  };

  const body = JSON.stringify(payload);
  const signature = stripe.webhooks.generateTestHeaderString({
    payload: body,
    secret: webhookSecret,
  });

  let child;
  let readyPromise;
  try {
    log(`Starting Next.js on :${PORT} (isolated Stripe env for this verify run)…`);
    ({ child, readyPromise } = startDevServerOnPort(PORT));

    await readyPromise;
    log("Compile ready; probing HTTP…");
    await waitForHttpOk(`${BASE}/sign-in`);

    const before = user.tokensAvailable;

    async function postWebhook() {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "stripe-signature": signature,
        },
        body,
      });
      const text = await res.text();
      return { res, text };
    }

    log("POST webhook (first delivery)…");
    const r1 = await postWebhook();
    if (!r1.res.ok) {
      throw new Error(`Webhook failed: ${r1.res.status} ${r1.text}`);
    }

    user = await prisma.user.findUnique({ where: { id: user.id } });
    const mid = user.tokensAvailable;
    if (mid !== before + tokens) {
      throw new Error(`Expected tokens ${before + tokens}, got ${mid}`);
    }

    const row1 = await prisma.stripeTokenPurchase.findUnique({
      where: { stripeCheckoutSessionId: sessionId },
    });
    if (!row1) {
      throw new Error("StripeTokenPurchase row missing after webhook");
    }

    log("POST webhook (duplicate delivery, same session id)…");
    const r2 = await postWebhook();
    if (!r2.res.ok) {
      throw new Error(`Duplicate webhook failed: ${r2.res.status} ${r2.text}`);
    }

    user = await prisma.user.findUnique({ where: { id: user.id } });
    if (user.tokensAvailable !== mid) {
      throw new Error(
        `Idempotency broken: tokens ${user.tokensAvailable} should still be ${mid}`,
      );
    }

    const looksLikePlaceholderSk = String(apiKey).includes("gatherE2ELocal");
    if (!looksLikePlaceholderSk) {
      log("Stripe key looks real — probing Checkout Session create via API…");
      try {
        const siteUrl = process.env.AUTH_URL?.replace(/\/$/, "") || `http://localhost:${PORT}`;
        const s = await stripe.checkout.sessions.create({
          mode: "payment",
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: { name: "Gather E2E ping" },
                unit_amount: 100,
              },
              quantity: 1,
            },
          ],
          success_url: `${siteUrl}/profile/tokens?checkout=e2e_ping`,
          cancel_url: `${siteUrl}/profile/tokens?checkout=cancelled`,
          metadata: { e2e: "1" },
        });
        log(`Stripe API OK — created session ${s.id} (${s.url ? "has url" : "no url"}).`);
      } catch (e) {
        log(`Stripe API Checkout create failed (non-fatal): ${e.message}`);
      }
    } else {
      log("Placeholder secret key — skipped live Stripe Checkout Session API call.");
    }

    log("All checks passed.");
  } finally {
    if (child) {
      log("Stopping dev server…");
      child.kill("SIGTERM");
      await new Promise((r) => setTimeout(r, 2500));
    }
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("[stripe-e2e] FAILED:", err);
  process.exit(1);
});
