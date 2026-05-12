import { auth } from "@/auth";
import { BottomNav } from "@/components/bottom-nav";
import { GatherWordmarkLink } from "@/components/branding/gather-wordmark-link";
import { MainAppCandlelitShell } from "@/components/main-app-candlelit-shell";
import { prisma } from "@/lib/prisma";
import { nextAppPath } from "@/lib/onboarding";
import { getUnreadCount } from "@/app/actions/notification";
import { lcChrome } from "@/lib/lc-classes";
import { redirect } from "next/navigation";

export default async function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });
  if (!user) redirect("/");

  const resume = nextAppPath(user);
  if (resume.startsWith("/onboarding")) redirect(resume);

  const unreadNotifs = await getUnreadCount(session.user.id);

  return (
    <MainAppCandlelitShell>
      <header className={lcChrome.headerBar}>
        <div className="flex justify-center">
          <GatherWordmarkLink href="/gatherings" size="landingSticky" />
        </div>
      </header>
      <div className="relative z-10 w-full px-4 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] sm:px-6 lg:px-10 xl:px-14">
        {children}
      </div>
      <BottomNav unreadNotifs={unreadNotifs} />
    </MainAppCandlelitShell>
  );
}
