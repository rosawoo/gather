"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { lcChrome } from "@/lib/lc-classes";

const tabs = [
  { href: "/gatherings", label: "Gatherings", icon: GatheringsIcon },
  { href: "/host", label: "Host", icon: HostIcon },
  { href: "/profile", label: "Profile", icon: ProfileIcon },
] as const;

export function BottomNav({ unreadNotifs = 0 }: { unreadNotifs?: number }) {
  const pathname = usePathname();

  return (
    <nav className={lcChrome.bottomNav}>
      <div className="flex w-full">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active =
            t.href === "/gatherings"
              ? pathname.startsWith("/gatherings")
              : t.href === "/profile"
                ? pathname.startsWith("/profile")
                : pathname.startsWith(t.href);
          const showBadge = t.href === "/profile" && unreadNotifs > 0;
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-1 flex-col items-center justify-center gap-1.5 px-2 pt-3 pb-2.5 text-center transition outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lc-tan-accent/75 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(34_17_13)] ${
                active ? lcChrome.navIconActive : lcChrome.navIconIdle
              }`}
            >
              <span className="relative">
                <Icon className="h-[26px] w-[26px]" active={active} />
                {showBadge ? (
                  <span className="absolute -right-2 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-lc-espresso">
                    {unreadNotifs > 99 ? "99+" : unreadNotifs}
                  </span>
                ) : null}
              </span>
              <span className="font-sans text-[16px] font-semibold tracking-wide text-inherit">
                {t.label}
              </span>
              {active ? (
                <span
                  aria-hidden
                  className="absolute left-1/2 top-0 h-[2px] w-11 -translate-x-1/2 rounded-full bg-lc-tan-accent"
                />
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function GatheringsIcon({
  className,
  active,
}: {
  className?: string;
  active?: boolean;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="8" cy="10" r="3" />
      <circle cx="16" cy="10" r="3" />
      <path d="M4 20c0-2.5 1.8-4 4-4s4 1.5 4 4" />
      <path d="M12 20c0-2.5 1.8-4 4-4s4 1.5 4 4" />
    </svg>
  );
}

function HostIcon({
  className,
  active,
}: {
  className?: string;
  active?: boolean;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 10.5 12 4l9 6.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

function ProfileIcon({
  className,
  active,
}: {
  className?: string;
  active?: boolean;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}
