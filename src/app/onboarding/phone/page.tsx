import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { nextAppPath } from "@/lib/onboarding";
import { redirect } from "next/navigation";
import { PhoneForm } from "./phone-form";

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
    <div className="min-h-full bg-gather-paper px-6 py-12 text-gather-ink">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-medium tracking-tight">Verify your phone</h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          We use your number for notifications and trust &amp; safety. With{" "}
          <strong>Twilio</strong> configured in <code className="text-xs">.env</code>
          , you&apos;ll get a real SMS. Without Twilio in development, check the
          terminal for the code, or use <strong>202600</strong> as a bypass.
        </p>
        <PhoneForm />
      </div>
    </div>
  );
}
