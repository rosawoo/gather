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
    <div className="mb-6 flex border-b border-neutral-200/70">
      {tabs.map((t) => {
        const active = t.exact
          ? pathname === t.href ||
            pathname === t.href + "/edit" ||
            pathname.startsWith("/profile/tokens") ||
            pathname.startsWith("/profile/u/")
          : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`relative flex-1 py-3 text-center text-[13px] font-semibold uppercase tracking-[0.14em] transition ${
              active
                ? "text-gather-brown"
                : "text-neutral-400 hover:text-gather-brown-mid"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              {t.label}
              {t.label === "Notifications" && unreadNotifs > 0 ? (
                <span className="inline-flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {unreadNotifs > 99 ? "99+" : unreadNotifs}
                </span>
              ) : null}
            </span>
            <span
              aria-hidden
              className={`pointer-events-none absolute -bottom-px left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-gather-brown transition-all duration-200 ${
                active ? "w-10 opacity-100" : "w-0 opacity-0"
              }`}
            />
          </Link>
        );
      })}
    </div>
  );
}
