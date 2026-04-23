"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/gatherings", label: "Discover", match: (p: string) => p === "/gatherings" || (p.startsWith("/gatherings/") && !p.startsWith("/gatherings/upcoming")) },
  { href: "/gatherings/upcoming", label: "Upcoming", match: (p: string) => p.startsWith("/gatherings/upcoming") },
] as const;

export function GatheringsTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex border-b border-neutral-200/70">
      {tabs.map((t) => {
        const active = t.match(pathname);
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
            {t.label}
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
