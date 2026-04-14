"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/profile", label: "Profile", exact: true as const },
  { href: "/profile/notifications", label: "Notifications", exact: false as const },
  { href: "/profile/settings", label: "Settings", exact: false as const },
] as const;

export function ProfileTabs({ unreadNotifs = 0 }: { unreadNotifs?: number }) {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex border-b border-neutral-200">
      {tabs.map((t) => {
        const active = t.exact
          ? pathname === t.href || pathname === t.href + "/edit"
          : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`relative flex-1 py-3 text-center text-sm font-medium transition ${
              active
                ? "border-b-2 border-gather-brown text-gather-brown"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            {t.label}
            {t.label === "Notifications" && unreadNotifs > 0 && (
              <span className="absolute top-2 ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
                {unreadNotifs > 99 ? "99+" : unreadNotifs}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
