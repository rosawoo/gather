"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeToE164 } from "@/lib/phone-e164";
import { isSmsConfigured, sendSmsToE164 } from "@/lib/sms";
import { redirect } from "next/navigation";

export type RequestPhoneCodeResult =
  | { ok: true; channel: "sms" }
  | { ok: true; channel: "console"; detail: string };

export async function requestPhoneCode(
  phoneRaw: string,
): Promise<RequestPhoneCodeResult> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  let phoneE164: string;
  try {
    phoneE164 = normalizeToE164(phoneRaw);
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : "Invalid phone");
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));

  await prisma.phoneOtp.create({
    data: {
      phone: phoneE164,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  const otpBody = `Welcome to Gather. A cozier way to meet people. Your verification code is ${code} (expires in 10 minutes). We'll only text you about things that matter. Reply STOP to opt out.`;

  if (isSmsConfigured()) {
    const result = await sendSmsToE164(phoneE164, otpBody, false);
    if (!result.ok) {
      throw new Error(
        result.error ??
          "Could not send SMS. Check Twilio credentials, trial verified numbers, and server logs.",
      );
    }
    return { ok: true, channel: "sms" };
  }

  if (process.env.NODE_ENV !== "production") {
    console.info(
      `[dev] No Twilio. OTP for ${phoneE164}: ${code} (or use bypass 202600)`,
    );
    return {
      ok: true,
      channel: "console",
      detail:
        "SMS isn’t configured (Twilio env vars missing on this server). Open the terminal where you run `npm run dev` to see the 6-digit code, or enter 202600.",
    };
  }

  throw new Error(
    "SMS is not configured on the server. In Vercel: Project → Settings → Environment Variables → add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER (or TWILIO_MESSAGING_SERVICE_SID) for Production, then redeploy.",
  );
}

export async function verifyPhoneCode(phoneRaw: string, code: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  let phoneE164: string;
  try {
    phoneE164 = normalizeToE164(phoneRaw);
  } catch {
    throw new Error("Invalid phone");
  }

  const twilioReady = isSmsConfigured();
  const devBypass =
    process.env.NODE_ENV !== "production" && !twilioReady && code === "202600";

  if (!devBypass) {
    const row = await prisma.phoneOtp.findFirst({
      where: {
        phone: phoneE164,
        code: code.trim(),
        consumed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!row) throw new Error("Invalid or expired code");
    await prisma.phoneOtp.update({
      where: { id: row.id },
      data: { consumed: true },
    });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      phone: phoneE164,
      phoneVerified: true,
      phoneVerifiedAt: new Date(),
    },
  });

  redirect("/onboarding/profile");
}
