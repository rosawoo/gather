import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { nextAppPath } from "@/lib/onboarding";
import { isSmsConfigured } from "@/lib/sms";
import { redirect } from "next/navigation";
import { PhoneForm } from "./phone-form";
import { OnboardingScaffold } from "@/components/auth/onboarding-scaffold";

export default async function PhonePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });
  if (!user) redirect("/");
  if (user.phoneVerified) redirect(nextAppPath(user));

  const twilioReady = isSmsConfigured();
  const showSmsConfigWarning =
    process.env.NODE_ENV === "production" && !twilioReady;

  return (
    <OnboardingScaffold
      step="phone"
      title="Add your phone (optional)"
      subtitle="US numbers only. Adds SMS alerts for requests and reminders. You'll still get everything in-app without it."
    >
      <PhoneForm showSmsConfigWarning={showSmsConfigWarning} />
      <div className="mt-6 text-center">
        <a
          href="/onboarding/profile"
          className="text-sm font-medium text-gather-brown-mid underline-offset-4 hover:underline"
        >
          Skip for now
        </a>
      </div>
    </OnboardingScaffold>
  );
}
