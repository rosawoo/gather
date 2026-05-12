"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { lcChrome } from "@/lib/lc-classes";

const tabs = [
  { href: "/profile", label: "Profile", exact: true as const },
  {
    href: "/profile/notifications",
    label: "Notifications",
    exact: false as const,
  },
  { href: "/profile/settings", label: "Settings", exact: false as const },
] as const;

export function ProfileTabs({ unreadNotifs = 0 }: { unreadNotifs?: number }) {
  const pathname = usePathname();
  const subtleNav = pathname === "/profile/tokens";

  return (
    <div
      className={
        subtleNav
          ? "mb-4 flex justify-center border-b border-white/[0.08]"
          : "mb-7 flex justify-center border-b border-lc-warm-shadow/35"
      }
    >
      <nav
        className={subtleNav ? "-mb-px flex items-stretch gap-1" : "-mb-px flex items-stretch gap-1 sm:gap-2"}
        aria-label="Profile sections"
      >
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
              className={`relative shrink-0 text-center lowercase transition ${
                subtleNav
                  ? "px-2.5 py-2 font-serif text-[14px] font-medium tracking-[0.04em] sm:px-3.5"
                  : "px-3 py-3.5 font-serif text-[17px] font-semibold tracking-[0.02em] sm:px-5"
              } ${
                active ? "text-lc-cream" : `${lcChrome.tabMutedUnderline}`
              }`}
            >
              <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
                {t.label}
                {t.label === "Notifications" && unreadNotifs > 0 ? (
                  <span className="inline-flex min-h-[19px] min-w-[19px] items-center justify-center rounded-full bg-red-500 px-1 font-sans text-[11px] font-bold leading-none text-white">
                    {unreadNotifs > 99 ? "99+" : unreadNotifs}
                  </span>
                ) : null}
              </span>
              <span
                aria-hidden
                className={`pointer-events-none absolute -bottom-px left-1/2 h-[2px] -translate-x-1/2 rounded-full ${lcChrome.pillUnderline} transition-all duration-200 ${
                  active ? "w-[calc(100%-0.75rem)] max-w-[6.5rem] opacity-100" : "w-0 opacity-0"
                }`}
              />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
