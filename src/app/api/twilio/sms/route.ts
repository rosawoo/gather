import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Twilio inbound SMS webhook — configure in Twilio Console for your number.
 * When a user texts STOP, we opt them out of non-OTP SMS.
 */
export async function POST(req: Request) {
  const form = await req.formData();
  const from = String(form.get("From") ?? "");
  const body = String(form.get("Body") ?? "")
    .trim()
    .toUpperCase();

  if (!from) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (body === "STOP" || body === "STOPALL" || body === "UNSUBSCRIBE") {
    const n = await prisma.user.updateMany({
      where: { phone: from, phoneVerified: true },
      data: { smsOptOut: true },
    });
    return NextResponse.json({
      ok: true,
      optedOut: n.count,
    });
  }

  if (body === "START" || body === "YES" || body === "UNSTOP") {
    await prisma.user.updateMany({
      where: { phone: from, phoneVerified: true },
      data: { smsOptOut: false },
    });
    return NextResponse.json({ ok: true, optedIn: true });
  }

  return NextResponse.json({ ok: true, ignored: true });
}
