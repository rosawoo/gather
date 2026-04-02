import { Plan, type Profile, type User } from "@prisma/client";

export type UserWithProfile = User & { profile: Profile | null };

export function nextAppPath(user: UserWithProfile): string {
  if (!user.phoneVerified) return "/onboarding/phone";
  if (!user.profileComplete || !user.profile) return "/onboarding/profile";
  if (user.plan === Plan.NONE) return "/onboarding/plan";
  return "/gatherings";
}
