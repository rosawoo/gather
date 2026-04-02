"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) throw new Error("Invalid phone");
  return raw.trim();
}

export async function requestPhoneCode(phoneRaw: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const phone = normalizePhone(phoneRaw);
  const code =
    process.env.NODE_ENV === "production"
      ? String(Math.floor(100000 + Math.random() * 900000))
      : "202600";

  await prisma.phoneOtp.create({
    data: {
      phone,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  // TODO: Twilio SMS in production
  if (process.env.NODE_ENV !== "production") {
    console.info(`[dev] OTP for ${phone}: ${code}`);
  }
}

export async function verifyPhoneCode(phoneRaw: string, code: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const phone = normalizePhone(phoneRaw);
  const devOk = process.env.NODE_ENV !== "production" && code === "202600";

  if (!devOk) {
    const row = await prisma.phoneOtp.findFirst({
      where: {
        phone,
        code,
        consumed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!row) throw new Error("Invalid code");
    await prisma.phoneOtp.update({
      where: { id: row.id },
      data: { consumed: true },
    });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      phone,
      phoneVerified: true,
      phoneVerifiedAt: new Date(),
    },
  });

  redirect("/onboarding/profile");
}
