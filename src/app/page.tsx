import { auth } from "@/auth";
import { AuthPanel } from "@/components/auth/auth-panel";
import { CandlelitPageShell } from "@/components/landing/candlelit-page-shell";
import { prisma } from "@/lib/prisma";
import { oauthCallbackPath } from "@/lib/oauth-callback-url";
import { nextAppPath } from "@/lib/onboarding";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Welcome — Gather",
  description:
    "Join Gather: host-led gatherings in real rooms near you. Treat new friends like old ones.",
};

type Props = {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
};

export default async function HomePage({ searchParams }: Props) {
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
      <main className="relative z-10 mx-auto w-full max-w-lg flex-1 px-4 pb-16 sm:px-6">
        <div className="landing-font-display landing-candlelit-hero-glow mx-auto mb-6 max-w-md text-center text-[1.65rem] font-normal leading-[1.12] text-[#f4eee7] sm:text-2xl md:text-[2.1rem]">
          treat new friends like old ones.
        </div>
        <div className="landing-auth-card landing-candlelit">
          <AuthPanel
            mode="sign-up"
            callbackUrl={callbackUrl}
            variant="candlelit"
            showBackLink={false}
          />
        </div>
        <p className="mx-auto mt-10 max-w-md text-center text-xs leading-relaxed text-[#a98974]/90">
          <Link
            href="/about"
            className="text-[#c6d8e3] underline-offset-4 hover:underline"
          >
            about
          </Link>
          <span aria-hidden className="mx-2 text-[#321308]">
            ·
          </span>
          <Link
            href="/terms-of-service"
            className="text-[#c6d8e3] underline-offset-4 hover:underline"
          >
            terms
          </Link>
          <span aria-hidden className="mx-2 text-[#321308]">
            ·
          </span>
          <Link
            href="/privacy-policy"
            className="text-[#c6d8e3] underline-offset-4 hover:underline"
          >
            privacy
          </Link>
          <span aria-hidden className="mx-2 text-[#321308]">
            ·
          </span>
          <Link
            href="/community-guidelines"
            className="text-[#c6d8e3] underline-offset-4 hover:underline"
          >
            community
          </Link>
        </p>
      </main>
    </CandlelitPageShell>
  );
}
