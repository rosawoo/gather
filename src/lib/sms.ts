import twilio from "twilio";
import { prisma } from "@/lib/prisma";

export function isSmsConfigured(): boolean {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_FROM_NUMBER?.trim();
  const msid = process.env.TWILIO_MESSAGING_SERVICE_SID?.trim();
  return Boolean(sid && token && (from || msid));
}

function twilioRestDetails(e: unknown): { message: string; code?: number } {
  if (e instanceof Error) {
    const any = e as Error & { code?: number };
    const code = typeof any.code === "number" ? any.code : undefined;
    return { message: e.message, code };
  }
  return { message: String(e) };
}

/** Turn Twilio API errors into actionable copy for onboarding / support. */
export function friendlyOutboundSmsError(
  raw: string,
  code?: number,
): string {
  const m = raw.toLowerCase();

  if (
    code === 21266 ||
    raw.includes("21266") ||
    m.includes("cannot be the same")
  ) {
    return "Twilio won’t deliver if the phone you’re verifying is the same as your Twilio sender number. Use a different mobile than TWILIO_FROM_NUMBER (or the number on your Messaging Service), then try again.";
  }
  if (code === 21610 || raw.includes("21610") || m.includes("unsubscribed")) {
    return "That number previously replied STOP (or Twilio treats it as opted out). Text START from that phone if allowed, or use a different mobile.";
  }
  if (
    code === 21608 ||
    raw.includes("21608") ||
    m.includes("trial") ||
    m.includes("not verified")
  ) {
    return "Twilio trial accounts can only SMS numbers you’ve marked as verified in Twilio (Console → Phone Numbers → Verified Caller IDs). Upgrade the Twilio project or verify the destination number, then try again.";
  }
  if (
    code === 21211 ||
    raw.includes("21211") ||
    (m.includes("invalid") && m.includes("to"))
  ) {
    return "Twilio rejected the destination number. Use a valid US mobile in E.164 (e.g. +15551234567).";
  }
  if (
    code === 21408 ||
    raw.includes("21408") ||
    m.includes("permission") ||
    raw.includes("60410") ||
    m.includes("geo-permissions")
  ) {
    return "Sending isn’t allowed for this route yet. In Twilio: Messaging → Settings → Geo permissions (enable US), and confirm your sender is approved for A2P / 10DLC if required.";
  }
  if (m.includes("authenticate") || raw.includes("20003")) {
    return "Twilio rejected the credentials (wrong Account SID / Auth Token). Double-check Vercel Production env vars and redeploy.";
  }
  if (
    code === 21606 ||
    m.includes("21606") ||
    (m.includes("from") && m.includes("invalid"))
  ) {
    return "The Twilio “from” number or Messaging Service SID is invalid. Use TWILIO_FROM_NUMBER in E.164 (+1…) or a valid TWILIO_MESSAGING_SERVICE_SID.";
  }
  if (
    code === 30007 ||
    code === 30008 ||
    raw.includes("30007") ||
    raw.includes("30008")
  ) {
    return "The carrier filtered or rejected this SMS (spam filters, inactive number, etc.). Try again later, another carrier/number, or check Twilio’s message logs for detail.";
  }

  const short =
    raw.length > 220 ? `${raw.slice(0, 217).trim()}…` : raw.trim();
  return `${short} If this persists, check Twilio debugger logs and Vercel function logs for this request.`;
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
    const { message, code } = twilioRestDetails(e);
    console.error("[sms:outbound]", code != null ? `Twilio ${code}` : "", message);
    return { ok: false, error: friendlyOutboundSmsError(message, code) };
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
