import { auth } from "@/auth";
import { AuthPanel } from "@/components/auth/auth-panel";
import { CandlelitPageShell } from "@/components/landing/candlelit-page-shell";
import { oauthCallbackPath } from "@/lib/oauth-callback-url";
import { prisma } from "@/lib/prisma";
import { nextAppPath } from "@/lib/onboarding";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{
    callbackUrl?: string | string[];
  }>;
};

export default async function SignInPage({ searchParams }: Props) {
  const session = await auth();
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });
    if (user) redirect(nextAppPath(user));
  }

  const sp = await searchParams;
  const callbackUrl = oauthCallbackPath(sp.callbackUrl, "/gatherings");

  return (
    <CandlelitPageShell>
      <main className="relative z-10 mx-auto w-full max-w-lg flex-1 px-4 pb-20 sm:px-6">
        <div className="landing-auth-card landing-candlelit">
          <AuthPanel
            mode="sign-in"
            callbackUrl={callbackUrl}
            variant="candlelit"
          />
        </div>
      </main>
    </CandlelitPageShell>
  );
}
