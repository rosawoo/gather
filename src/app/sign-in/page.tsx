import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { nextAppPath } from "@/lib/onboarding";
import { redirect } from "next/navigation";
import { AuthPanel } from "@/components/auth/auth-panel";

type Props = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

function normalizeCallback(raw: string | undefined): string {
  if (typeof raw !== "string") return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  if (raw.includes("://") || raw.includes("..")) return "/";
  return raw;
}

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
  const callbackUrl = normalizeCallback(sp.callbackUrl);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-gather-cream px-4 py-12 text-gather-ink sm:px-8 sm:py-16 lg:px-12">
      <AuthPanel mode="sign-in" callbackUrl={callbackUrl} />
    </div>
  );
}
