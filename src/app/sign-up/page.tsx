import { auth } from "@/auth";
import { oauthCallbackPath } from "@/lib/oauth-callback-url";
import { prisma } from "@/lib/prisma";
import { nextAppPath } from "@/lib/onboarding";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
};

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
  if (sp.callbackUrl !== undefined) {
    const cb = oauthCallbackPath(sp.callbackUrl, "/gatherings");
    redirect(`/?callbackUrl=${encodeURIComponent(cb)}`);
  }
  redirect("/");
}
