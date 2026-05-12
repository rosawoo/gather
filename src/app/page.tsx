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
  title: "Welcome · Gather",
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
        <p className="mx-auto mt-10 max-w-md text-center text-[12.5px] leading-snug text-[rgba(244,238,231,0.78)] sm:mt-12">
          <Link
            href="/about"
            className="font-medium text-[rgba(214,230,239,0.95)] underline decoration-[#c6d8e3]/45 underline-offset-[4px] transition hover:text-[#f4eee7]"
          >
            about
          </Link>
          <span aria-hidden className="mx-2.5 text-[#5c3d32]">
            ·
          </span>
          <Link
            href="/terms-of-service"
            className="font-medium text-[rgba(214,230,239,0.95)] underline decoration-[#c6d8e3]/45 underline-offset-[4px] transition hover:text-[#f4eee7]"
          >
            terms
          </Link>
          <span aria-hidden className="mx-2.5 text-[#5c3d32]">
            ·
          </span>
          <Link
            href="/privacy-policy"
            className="font-medium text-[rgba(214,230,239,0.95)] underline decoration-[#c6d8e3]/45 underline-offset-[4px] transition hover:text-[#f4eee7]"
          >
            privacy
          </Link>
          <span aria-hidden className="mx-2.5 text-[#5c3d32]">
            ·
          </span>
          <Link
            href="/community-guidelines"
            className="font-medium text-[rgba(214,230,239,0.95)] underline decoration-[#c6d8e3]/45 underline-offset-[4px] transition hover:text-[#f4eee7]"
          >
            community
          </Link>
        </p>
      </main>
    </CandlelitPageShell>
  );
}
