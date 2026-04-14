"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/profile", label: "Profile", exact: true },
  { href: "/profile/notifications", label: "Notifications" },
  { href: "/profile/settings", label: "Settings" },
] as const;

export function ProfileTabs({ unreadNotifs = 0 }: { unreadNotifs?: number }) {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex gap-2 rounded-full bg-white/80 p-1 shadow-sm ring-1 ring-neutral-200/80">
      {tabs.map((t) => {
        const active = t.exact
          ? pathname === t.href || pathname === t.href + "/edit"
          : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`relative flex-1 rounded-full py-2.5 text-center text-sm font-medium transition ${
              active
                ? "bg-gather-brown text-gather-cream"
                : "text-neutral-600 hover:text-gather-ink"
            }`}
          >
            {t.label}
            {t.label === "Notifications" && unreadNotifs > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
                {unreadNotifs > 99 ? "99+" : unreadNotifs}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
