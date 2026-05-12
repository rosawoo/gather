"use client";

import { useState } from "react";
import { CoverEditor } from "@/components/cover-editor";

export function CustomizeCoverCollapsible({
  summary = "Customize cover art",
}: {
  summary?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-gather-teal/25 bg-lc-settings-parchment-soft/90 shadow-sm ring-1 ring-black/[0.04]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-left transition hover:bg-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gather-accent sm:py-4"
      >
        <div className="min-w-0">
          <span className="font-serif text-[15px] font-semibold text-lc-settings-ink-strong sm:text-[16px]">
            {summary}
          </span>
          <span className="mt-1 block text-[13px] leading-snug text-lc-settings-helper">
            Starts on a Polaroid-friendly template—add stickers &amp; overlays, or paste a sharp
            GIF. Templates read cleaner on the wall than blurry phone shots.
          </span>
        </div>
        <span
          className={`shrink-0 text-lc-settings-label transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div
        className={
          open
            ? "border-t border-gather-teal/20 px-4 pb-5 pt-3 sm:px-5 sm:pt-4"
            : "hidden"
        }
        aria-hidden={!open}
      >
        <CoverEditor density="hostForm" />
      </div>
    </div>
  );
}
