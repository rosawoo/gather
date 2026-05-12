"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parsePersonalitySlots } from "@/lib/prompts";
import { normalizeMoodBoardDecorJson } from "@/lib/mood-board";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function ageFromDob(dob: Date) {
  const t = new Date();
  let age = t.getFullYear() - dob.getFullYear();
  const m = t.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < dob.getDate())) age--;
  return age;
}

export async function completeProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const firstName = String(formData.get("firstName") ?? "").trim();
  const dobStr = String(formData.get("dateOfBirth") ?? "");
  const neighborhood = String(formData.get("neighborhood") ?? "").trim();
  const college = String(formData.get("college") ?? "").trim();
  const job = String(formData.get("job") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const photoUrlsRaw = String(formData.get("photoUrls") ?? "").trim();

  if (!firstName) throw new Error("First name required");
  const dateOfBirth = new Date(dobStr);
  if (Number.isNaN(dateOfBirth.getTime())) throw new Error("Invalid date");
  if (ageFromDob(dateOfBirth) < 21) throw new Error("Must be 21+");

  const photoUrls = photoUrlsRaw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (photoUrls.length < 1) throw new Error("At least one photo URL required");

  const answers = parsePersonalitySlots(formData);
  if (answers.length < 2) throw new Error("Answer at least 2 prompts");

  const userId = session.user.id;

  await prisma.$transaction(async (tx) => {
    await tx.profile.upsert({
      where: { userId },
      create: {
        userId,
        firstName,
        dateOfBirth,
        neighborhood: neighborhood || null,
        college: college || null,
        job: job || null,
        bio,
      },
      update: {
        firstName,
        dateOfBirth,
        neighborhood: neighborhood || null,
        college: college || null,
        job: job || null,
        bio,
      },
    });

    await tx.profilePhoto.deleteMany({ where: { userId } });
    await tx.profilePhoto.createMany({
      data: photoUrls.map((url, i) => ({
        userId,
        url,
        sortOrder: i,
        isPrimary: i === 0,
      })),
    });

    await tx.profilePromptAnswer.deleteMany({ where: { userId } });
    await tx.profilePromptAnswer.createMany({
      data: answers.map((a) => ({
        userId,
        promptKey: a.key,
        body: a.body,
      })),
    });

    await tx.user.update({
      where: { id: userId },
      data: { profileComplete: true, name: firstName },
    });
  });

  redirect("/onboarding/plan");
}

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const firstName = String(formData.get("firstName") ?? "").trim();
  const dobStr = String(formData.get("dateOfBirth") ?? "");
  const neighborhood = String(formData.get("neighborhood") ?? "").trim();
  const college = String(formData.get("college") ?? "").trim();
  const job = String(formData.get("job") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const photoUrlsRaw = String(formData.get("photoUrls") ?? "").trim();

  if (!firstName) throw new Error("First name required");
  const dateOfBirth = new Date(dobStr);
  if (Number.isNaN(dateOfBirth.getTime())) throw new Error("Invalid date");
  if (ageFromDob(dateOfBirth) < 21) throw new Error("Must be 21+");

  const photoUrls = photoUrlsRaw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (photoUrls.length < 1) throw new Error("At least one photo URL required");

  const answers = parsePersonalitySlots(formData);
  if (answers.length < 2) throw new Error("Answer at least 2 prompts");

  const moodBoardEnabled = formData.get("moodBoardEnabled") === "on";
  const moodBoardDecor = normalizeMoodBoardDecorJson(
    String(formData.get("moodBoardDecor") ?? ""),
  );

  const userId = session.user.id;

  await prisma.$transaction(async (tx) => {
    await tx.profile.update({
      where: { userId },
      data: {
        firstName,
        dateOfBirth,
        neighborhood: neighborhood || null,
        college: college || null,
        job: job || null,
        bio,
        moodBoardEnabled,
        moodBoardDecor: moodBoardEnabled ? moodBoardDecor : null,
      },
    });

    await tx.profilePhoto.deleteMany({ where: { userId } });
    await tx.profilePhoto.createMany({
      data: photoUrls.map((url, i) => ({
        userId,
        url,
        sortOrder: i,
        isPrimary: i === 0,
      })),
    });

    await tx.profilePromptAnswer.deleteMany({ where: { userId } });
    await tx.profilePromptAnswer.createMany({
      data: answers.map((a) => ({
        userId,
        promptKey: a.key,
        body: a.body,
      })),
    });

    await tx.user.update({
      where: { id: userId },
      data: { name: firstName },
    });
  });

  revalidatePath("/profile");
  revalidatePath(`/u/${userId}`);
  redirect("/profile");
}
