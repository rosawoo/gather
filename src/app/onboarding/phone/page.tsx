import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { nextAppPath } from "@/lib/onboarding";
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

  return (
    <OnboardingScaffold
      step="phone"
      title="Verify your phone"
      subtitle="We use your number for notifications and trust & safety."
    >
      <div className="rounded-2xl border border-gather-accent/30 bg-gather-cream/50 px-4 py-3 text-xs leading-relaxed text-gather-brown-mid">
        With <strong>Twilio</strong> configured in{" "}
        <code className="rounded bg-white/70 px-1 py-0.5 text-[11px]">.env</code>
        , you&apos;ll get a real SMS. Without Twilio in development, check the
        terminal for the code — or use <strong>202600</strong> as a bypass.
      </div>
      <PhoneForm />
    </OnboardingScaffold>
  );
}
