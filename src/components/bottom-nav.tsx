"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/gatherings", label: "Gatherings", icon: GatheringsIcon },
  { href: "/host", label: "Host", icon: HostIcon },
  { href: "/profile", label: "Profile", icon: ProfileIcon },
] as const;

export function BottomNav({ unreadNotifs = 0 }: { unreadNotifs?: number }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gather-teal/25 bg-gather-paper/92 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md">
      <div className="mx-auto flex max-w-lg">
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
              className={`relative flex flex-1 flex-col items-center justify-center gap-1 px-3 pt-2.5 pb-2 text-center transition ${
                active
                  ? "text-gather-teal"
                  : "text-gather-charcoal/80 hover:text-gather-ink"
              }`}
            >
              <span className="relative">
                <Icon className="h-[22px] w-[22px]" active={active} />
                {showBadge ? (
                  <span className="absolute -right-2 -top-1 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-gather-paper">
                    {unreadNotifs > 99 ? "99+" : unreadNotifs}
                  </span>
                ) : null}
              </span>
              <span
                className={`text-[11px] font-semibold tracking-tight ${
                  active ? "text-gather-teal" : "text-gather-charcoal/80"
                }`}
              >
                {t.label}
              </span>
              {active ? (
                <span
                  aria-hidden
                  className="absolute left-1/2 top-0 h-[2px] w-8 -translate-x-1/2 rounded-full bg-gather-teal"
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
