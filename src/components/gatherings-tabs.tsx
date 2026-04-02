"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function GatheringsTabs() {
  const pathname = usePathname();
  const isUpcoming = pathname.startsWith("/gatherings/upcoming");

  return (
    <div className="mb-6 flex gap-2 rounded-full bg-white/80 p-1 shadow-sm ring-1 ring-neutral-200/80">
      <Link
        href="/gatherings"
        className={`flex-1 rounded-full py-2.5 text-center text-sm font-medium transition ${
          !isUpcoming
            ? "bg-gather-brown text-gather-cream"
            : "text-neutral-600 hover:text-gather-ink"
        }`}
      >
        Discover
      </Link>
      <Link
        href="/gatherings/upcoming"
        className={`flex-1 rounded-full py-2.5 text-center text-sm font-medium transition ${
          isUpcoming
            ? "bg-gather-brown text-gather-cream"
            : "text-neutral-600 hover:text-gather-ink"
        }`}
      >
        Upcoming
      </Link>
    </div>
  );
}
