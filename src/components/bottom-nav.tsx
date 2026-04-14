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
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-gather-paper/95 backdrop-blur-md safe-area-pb">
      <div className="mx-auto flex max-w-lg justify-around py-2">
        {tabs.map((t) => {
          const active =
            t.href === "/gatherings"
              ? pathname.startsWith("/gatherings")
              : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`relative rounded-full px-4 py-2 text-sm font-medium transition ${
                active
                  ? "bg-gather-brown text-gather-cream"
                  : "text-neutral-600 hover:text-gather-ink"
              }`}
            >
              {t.label}
              {t.href === "/profile" && unreadNotifs > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
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
