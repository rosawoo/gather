"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/gatherings", label: "Gatherings" },
  { href: "/host", label: "Host" },
  { href: "/profile", label: "Profile" },
] as const;

export function BottomNav({ unreadNotifs = 0 }: { unreadNotifs?: number }) {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 right-0 top-0 z-40 border-b border-neutral-200/70 bg-gather-paper/90 pt-[env(safe-area-inset-top,0px)] backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center gap-1 px-3 py-2.5">
        {tabs.map((t) => {
          const active =
            t.href === "/gatherings"
              ? pathname.startsWith("/gatherings")
              : t.href === "/profile"
                ? pathname.startsWith("/profile")
                : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-9 flex-1 items-center justify-center rounded-full px-3 text-center text-[13px] font-medium tracking-tight transition ${
                active
                  ? "bg-gather-brown text-gather-cream shadow-sm"
                  : "text-neutral-500 hover:bg-gather-brown/[0.06] hover:text-gather-ink"
              }`}
            >
              {t.label}
              {t.href === "/profile" && unreadNotifs > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-gather-paper">
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
