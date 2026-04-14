"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function GatheringsTabs() {
  const pathname = usePathname();
  const isUpcoming = pathname.startsWith("/gatherings/upcoming");

  return (
    <div className="mb-6 flex border-b border-neutral-200">
      <Link
        href="/gatherings"
        className={`flex-1 py-3 text-center text-sm font-medium transition ${
          !isUpcoming
            ? "border-b-2 border-gather-brown text-gather-brown"
            : "text-neutral-400 hover:text-neutral-600"
        }`}
      >
        Discover
      </Link>
      <Link
        href="/gatherings/upcoming"
        className={`flex-1 py-3 text-center text-sm font-medium transition ${
          isUpcoming
            ? "border-b-2 border-gather-brown text-gather-brown"
            : "text-neutral-400 hover:text-neutral-600"
        }`}
      >
        Upcoming
      </Link>
    </div>
  );
}
