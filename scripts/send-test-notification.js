#!/usr/bin/env node
require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.local", override: true });

const { PrismaClient } = require("@prisma/client");
const twilio = require("twilio");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const PHONE_E164 = "+17866317778";
const PHONE_LOCAL = "7866317778";
const EMAIL = "rc6272005@gmail.com";
const TITLE = "Test notification";
const BODY = "This is a test from scripts/send-test-notification.js. If you see this in-app and on your phone, both channels are working.";

/** E.164 destination for SMS. Must differ from TWILIO_FROM_NUMBER (Twilio error 21266). */
const SMS_TO_E164 =
  (process.env.TWILIO_TEST_TO || "").trim() || PHONE_E164;

function digitsOnly(s) {
  return String(s).replace(/\D/g, "");
}

function isSmsConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      (process.env.TWILIO_FROM_NUMBER ||
        process.env.TWILIO_MESSAGING_SERVICE_SID),
  );
}

async function sendSmsTwilio(toE164, body) {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
  );
  const msid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const msg = await client.messages.create({
    to: toE164,
    body,
    ...(msid
      ? { messagingServiceSid: msid }
      : { from: process.env.TWILIO_FROM_NUMBER }),
  });
  return { provider: "twilio", ok: true, sid: msg.sid, status: msg.status };
}

async function sendSmsTextBelt(toE164, body) {
  const key = process.env.TEXTBELT_KEY || "textbelt";
  const res = await fetch("https://textbelt.com/text", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ phone: toE164, message: body, key }),
  });
  const data = await res.json();
  return { provider: "textbelt", ...data };
}

function isAwsSnsConfigured() {
  return Boolean(
    process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      (process.env.AWS_SMS_REGION || process.env.AWS_REGION),
  );
}

async function sendSmsAwsSns(toE164, body) {
  const region =
    process.env.AWS_SMS_REGION || process.env.AWS_REGION || "us-east-1";
  const client = new SNSClient({ region });
  const out = await client.send(
    new PublishCommand({
      PhoneNumber: toE164,
      Message: body,
      MessageAttributes: {
        "AWS.SNS.SMS.SMSType": {
          DataType: "String",
          StringValue: "Transactional",
        },
      },
    }),
  );
  return { provider: "aws-sns", ok: true, messageId: out.MessageId, region };
}

async function sendSms(toE164, body) {
  if (isSmsConfigured()) return sendSmsTwilio(toE164, body);
  if (isAwsSnsConfigured()) return sendSmsAwsSns(toE164, body);
  console.log("[sms] No Twilio/AWS creds. Falling back to TextBelt");
  return sendSmsTextBelt(toE164, body);
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: EMAIL },
          { phone: PHONE_E164 },
          { phone: PHONE_LOCAL },
        ],
      },
      select: {
        id: true,
        email: true,
        phone: true,
        phoneVerified: true,
        smsOptOut: true,
      },
    });

    if (!user) {
      console.error(
        `[fail] No user found with email=${EMAIL} or phone=${PHONE_E164}.`,
      );
      process.exitCode = 1;
      return;
    }

    console.log("[user]", user);

    const notif = await prisma.notification.create({
      data: {
        userId: user.id,
        title: TITLE,
        body: BODY,
        kind: "test",
      },
    });
    console.log(`[in-app] created notification id=${notif.id}`);

    if (user.smsOptOut) {
      console.warn("[sms] user.smsOptOut=true. Real app would skip. Sending anyway for this test.");
    }
    if (!user.phoneVerified) {
      console.warn("[sms] user.phoneVerified=false. Real app (sendSmsToUser) would skip. Sending direct for this test.");
    }

    console.log("[sms] sending to", SMS_TO_E164);

    const fromRaw = process.env.TWILIO_FROM_NUMBER || "";
    if (
      fromRaw &&
      !process.env.TWILIO_MESSAGING_SERVICE_SID &&
      digitsOnly(fromRaw) === digitsOnly(SMS_TO_E164)
    ) {
      console.error(
        "[fail] TWILIO_FROM_NUMBER and SMS destination are the same number. Twilio cannot send SMS from a number to itself.\n" +
          "  Fix: set TWILIO_FROM_NUMBER to your Twilio-purchased number, and set TWILIO_TEST_TO in .env to a different phone (verified on trial).",
      );
      process.exitCode = 1;
      return;
    }

    const smsResult = await sendSms(SMS_TO_E164, BODY);
    console.log("[sms]", smsResult);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
