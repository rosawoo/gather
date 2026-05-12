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
    <div className="flex min-h-full flex-1 flex-col bg-gather-espresso px-6 py-12 text-gather-cream sm:py-16">
      <AuthPanel mode="sign-up" callbackUrl={callbackUrl} />
    </div>
  );
}
