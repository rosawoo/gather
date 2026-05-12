import twilio from "twilio";
import { prisma } from "@/lib/prisma";

export function isSmsConfigured(): boolean {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_FROM_NUMBER?.trim();
  const msid = process.env.TWILIO_MESSAGING_SERVICE_SID?.trim();
  return Boolean(sid && token && (from || msid));
}

const gatherFooter =
      "\n\nGather. Reply STOP to opt out of non-critical SMS.";

/**
 * Low-level send. Use `sendSmsToUser` for product messages (respects opt-out).
 * @param appendFooter - set false for OTP / compliance copy that already includes STOP.
 */
export async function sendSmsToE164(
  toE164: string,
  body: string,
  appendFooter = true,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSmsConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.info(`[sms:skipped] to=${toE164} ${body.slice(0, 120)}…`);
    }
    return { ok: false, error: "Twilio not configured" };
  }

  try {
    const sid = process.env.TWILIO_ACCOUNT_SID!.trim();
    const token = process.env.TWILIO_AUTH_TOKEN!.trim();
    const client = twilio(sid, token);
    const text = appendFooter ? body + gatherFooter : body;
    const msid = process.env.TWILIO_MESSAGING_SERVICE_SID?.trim();
    const from = process.env.TWILIO_FROM_NUMBER?.trim();
    await client.messages.create({
      to: toE164,
      body: text,
      ...(msid
        ? { messagingServiceSid: msid }
        : { from: from! }),
    });
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[sms]", msg);
    return { ok: false, error: msg };
  }
}

/** Transactional SMS after phone is verified; skips if user opted out. */
export async function sendSmsToUser(
  userId: string,
  body: string,
): Promise<void> {
  const u = await prisma.user.findUnique({ where: { id: userId } });
  if (!u?.phone || !u.phoneVerified || u.smsOptOut) return;
  await sendSmsToE164(u.phone, body, true);
}
