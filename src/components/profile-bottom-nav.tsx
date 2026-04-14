"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/profile", label: "Profile", match: "profile" as const },
  {
    href: "/profile/settings",
    label: "Settings",
    match: "settings" as const,
  },
  {
    href: "/profile/notifications",
    label: "Notifications",
    match: "notifications" as const,
  },
] as const;

function tabActive(
  pathname: string,
  match: (typeof tabs)[number]["match"],
): boolean {
  if (match === "notifications") {
    return pathname.startsWith("/profile/notifications");
  }
  if (match === "settings") {
    return pathname.startsWith("/profile/settings");
  }
  // Profile hub + edit, tokens, etc. — not settings/notifications
  return (
    pathname.startsWith("/profile") &&
    !pathname.startsWith("/profile/settings") &&
    !pathname.startsWith("/profile/notifications")
  );
}

export function ProfileBottomNav({
  unreadNotifs = 0,
}: {
  unreadNotifs?: number;
}) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-gather-paper/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md">
      <div className="mx-auto flex max-w-lg gap-1 px-2 py-2">
        {tabs.map((t) => {
          const active = tabActive(pathname, t.match);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`relative flex min-h-10 flex-1 items-center justify-center rounded-xl px-1.5 text-center text-xs font-medium leading-tight transition sm:text-sm ${
                active
                  ? "bg-gather-brown text-gather-cream shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-200/60 hover:text-gather-ink"
              }`}
            >
              <span className="px-0.5">{t.label}</span>
              {t.match === "notifications" && unreadNotifs > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-gather-paper">
                  {unreadNotifs > 99 ? "99+" : unreadNotifs}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
