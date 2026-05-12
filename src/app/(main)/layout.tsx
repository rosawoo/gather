import { auth } from "@/auth";
import { BottomNav } from "@/components/bottom-nav";
import { prisma } from "@/lib/prisma";
import { nextAppPath } from "@/lib/onboarding";
import { getUnreadCount } from "@/app/actions/notification";
import Link from "next/link";
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
      <header className="flex justify-center border-b border-gather-line/60 bg-gather-cream/40 px-4 py-3 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)]">
        <Link
          href="/gatherings"
          className="landing-font-display text-[2rem] font-normal lowercase leading-none tracking-tight text-gather-ink no-underline sm:text-[2.25rem]"
        >
          gather
        </Link>
      </header>
      <div className="w-full px-4 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] sm:px-6 lg:px-10 xl:px-14">
        {children}
      </div>
      <BottomNav unreadNotifs={unreadNotifs} />
    </div>
  );
}
