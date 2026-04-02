import { auth } from "@/auth";
import { BottomNav } from "@/components/bottom-nav";
import { prisma } from "@/lib/prisma";
import { nextAppPath } from "@/lib/onboarding";
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

  return (
    <div className="min-h-full bg-gather-paper text-gather-ink">
      <div className="mx-auto max-w-lg pb-24 pt-4">{children}</div>
      <BottomNav />
    </div>
  );
}
