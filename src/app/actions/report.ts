"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ReportTarget } from "@prisma/client";
import { redirect } from "next/navigation";

export async function submitReport(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const targetType = String(formData.get("targetType") ?? "user");
  const targetId = String(formData.get("targetId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) throw new Error("Empty report");

  const rt =
    targetType === "gathering" ? ReportTarget.GATHERING : ReportTarget.USER;

  await prisma.report.create({
    data: {
      reporterId: session.user.id,
      targetType: rt,
      targetUserId: rt === ReportTarget.USER ? targetId || null : null,
      gatheringId: rt === ReportTarget.GATHERING ? targetId || null : null,
      body,
    },
  });

  redirect("/profile");
}
