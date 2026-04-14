import { auth } from "@/auth";
import { MainTopNav } from "@/components/main-top-nav";
import { ProfileBottomNav } from "@/components/profile-bottom-nav";
import { prisma } from "@/lib/prisma";
import { nextAppPath } from "@/lib/onboarding";
import { getUnreadCount } from "@/app/actions/notification";
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
    <div className="min-h-full bg-gather-paper text-gather-ink">
      <MainTopNav />
      <div className="mx-auto max-w-lg px-3 pb-[calc(env(safe-area-inset-bottom,0px)+4rem)] pt-[calc(env(safe-area-inset-top,0px)+4rem)] sm:px-4">
        {children}
      </div>
      <ProfileBottomNav unreadNotifs={unreadNotifs} />
    </div>
  );
}
