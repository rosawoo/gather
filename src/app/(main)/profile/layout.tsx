import { auth } from "@/auth";
import { ProfileTabs } from "@/components/profile-tabs";
import { getUnreadCount } from "@/app/actions/notification";

export default async function ProfileSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const unreadNotifs = await getUnreadCount(session!.user!.id);

  return (
    <div>
      <ProfileTabs unreadNotifs={unreadNotifs} />
      <div className="px-4">{children}</div>
    </div>
  );
}
