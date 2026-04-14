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
    <nav className="fixed left-0 right-0 top-0 z-40 border-b border-neutral-200 bg-gather-paper/95 pt-[env(safe-area-inset-top,0px)] backdrop-blur-md">
      <div className="mx-auto flex max-w-lg gap-1 px-2 py-2">
        {tabs.map((t) => {
          const active =
            t.href === "/gatherings"
              ? pathname.startsWith("/gatherings")
              : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`relative flex min-h-10 flex-1 items-center justify-center rounded-xl px-2 text-center text-sm font-medium transition ${
                active
                  ? "bg-gather-brown text-gather-cream shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-200/60 hover:text-gather-ink"
              }`}
            >
              {t.label}
              {t.href === "/profile" && unreadNotifs > 0 && (
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
