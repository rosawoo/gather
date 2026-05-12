import { auth } from "@/auth";
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

/** Canonical welcome / sign-up lives at `/`; keep `/sign-up` as a redirect for old links. */
export default async function SignUpPageRedirect({ searchParams }: Props) {
  const session = await auth();
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });
    if (user) redirect(nextAppPath(user));
  }

  const sp = await searchParams;
  const params = new URLSearchParams();
  if (typeof sp.callbackUrl === "string") {
    params.set("callbackUrl", normalizeCallback(sp.callbackUrl));
  }
  redirect(params.size ? `/?${params.toString()}` : "/");
}
