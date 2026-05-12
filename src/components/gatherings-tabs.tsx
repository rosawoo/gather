"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/gatherings", label: "discover", match: (p: string) => p === "/gatherings" || (p.startsWith("/gatherings/") && !p.startsWith("/gatherings/upcoming")) },
  { href: "/gatherings/upcoming", label: "upcoming", match: (p: string) => p.startsWith("/gatherings/upcoming") },
] as const;

export function GatheringsTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-5 flex border-b border-white/10">
      {tabs.map((t) => {
        const active = t.match(pathname);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`relative flex-1 py-3 text-center text-[15px] font-medium tracking-wide transition lowercase ${
              active
                ? "text-gather-cream"
                : "text-gather-cream/45 hover:text-gather-cream/70"
            }`}
          >
            {t.label}
            <span
              aria-hidden
              className={`pointer-events-none absolute -bottom-px left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-gather-cream transition-all duration-200 ${
                active ? "w-9 opacity-100" : "w-0 opacity-0"
              }`}
            />
          </Link>
        );
      })}
    </div>
  );
}
