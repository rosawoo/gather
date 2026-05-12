import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { nextAppPath } from "@/lib/onboarding";
import { getUsedNeighborhoods } from "@/lib/neighborhoods";
import { redirect } from "next/navigation";
import { OnboardingScaffold } from "@/components/auth/onboarding-scaffold";
import { OnboardingProfileForm } from "@/components/onboarding-profile-form";

export default async function ProfileOnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });
  if (!user) redirect("/");
  if (user.profileComplete) redirect(nextAppPath(user));

  const usedNeighborhoods = await getUsedNeighborhoods();

  return (
    <OnboardingScaffold
      step="profile"
      title="Your profile"
      subtitle="A few thoughtful details, like a dating app, but for gatherings."
    >
      <OnboardingProfileForm usedNeighborhoods={usedNeighborhoods} />
    </OnboardingScaffold>
  );
}
