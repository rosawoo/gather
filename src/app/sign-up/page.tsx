import { auth } from "@/auth";
import { AuthPanel } from "@/components/auth/auth-panel";
import { CandlelitPageShell } from "@/components/landing/candlelit-page-shell";
import { prisma } from "@/lib/prisma";
import { nextAppPath } from "@/lib/onboarding";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

function normalizeCallback(raw: string | undefined): string {
  if (typeof raw !== "string") return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  if (raw.includes("://") || raw.includes("..")) return "/";
  return raw;
}

export default async function SignUpPage({ searchParams }: Props) {
  const session = await auth();
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });
    if (user) redirect(nextAppPath(user));
  }

  const sp = await searchParams;
  const callbackUrl = normalizeCallback(sp.callbackUrl);

  return (
    <CandlelitPageShell>
      <main className="relative z-10 mx-auto w-full max-w-lg flex-1 px-4 pb-20 sm:px-6">
        <div className="landing-auth-card landing-candlelit">
          <AuthPanel
            mode="sign-up"
            callbackUrl={callbackUrl}
            variant="candlelit"
          />
        </div>
      </main>
    </CandlelitPageShell>
  );
}
