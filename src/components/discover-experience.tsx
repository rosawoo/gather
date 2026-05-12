"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DiscoverFilters } from "@/components/discover-filters";
import { PolaroidCard, type PolaroidCardData } from "@/components/polaroid-card";

/** Jewel + espresso washes that track the focused polaroid while scrolling. */
const MOOD_BACKGROUNDS = [
  "linear-gradient(168deg, #3a1f28 0%, #6b2f3a 40%, #241018 100%)",
  "linear-gradient(168deg, #0f2830 0%, #1e5d74 45%, #0a181c 100%)",
  "linear-gradient(168deg, #4a1c0c 0%, #9e3b1b 42%, #2e1206 100%)",
  "linear-gradient(168deg, #1e1428 0%, #4a3270 48%, #120c1a 100%)",
  "linear-gradient(168deg, #4a3018 0%, #c45c2c 40%, #2a180c 100%)",
] as const;

function moodForIndex(i: number, len: number) {
  if (len <= 0) return MOOD_BACKGROUNDS[0];
  return MOOD_BACKGROUNDS[i % MOOD_BACKGROUNDS.length];
}

export function DiscoverExperience({
  neighborhoods,
  items,
  hasActiveFilters,
}: {
  neighborhoods: string[];
  items: PolaroidCardData[];
  hasActiveFilters: boolean;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const recompute = useCallback(() => {
    const root = stripRef.current;
    if (!root || items.length === 0) {
      setActiveIdx(0);
      return;
    }

    const cards = root.querySelectorAll<HTMLElement>("[data-discover-card]");
    if (cards.length === 0) {
      setActiveIdx(0);
      return;
    }

    const horizontal = root.scrollWidth > root.clientWidth + 8;
    const rootRect = root.getBoundingClientRect();
    const centerX = horizontal
      ? rootRect.left + rootRect.width / 2
      : window.innerWidth / 2;
    const centerY = window.innerHeight * 0.42;

    let best = 0;
    let bestScore = Infinity;

    cards.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const midX = r.left + r.width / 2;
      const midY = r.top + r.height / 2;
      const dx = Math.abs(midX - centerX);
      const dy = horizontal
        ? Math.abs(midY - centerY) * 0.35
        : Math.abs(midY - centerY);
      const score = dx + dy;
      if (score < bestScore) {
        bestScore = score;
        best = i;
      }
    });

    setActiveIdx(best);
  }, [items]);

  const scheduleRecompute = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      recompute();
    });
  }, [recompute]);

  useEffect(() => {
    scheduleRecompute();
  }, [items, scheduleRecompute]);

  useEffect(() => {
    const root = stripRef.current;
    if (!root) return;

    root.addEventListener("scroll", scheduleRecompute, { passive: true });
    window.addEventListener("scroll", scheduleRecompute, { passive: true });
    window.addEventListener("resize", scheduleRecompute);
    const ro = new ResizeObserver(scheduleRecompute);
    ro.observe(root);

    return () => {
      root.removeEventListener("scroll", scheduleRecompute);
      window.removeEventListener("scroll", scheduleRecompute);
      window.removeEventListener("resize", scheduleRecompute);
      ro.disconnect();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [scheduleRecompute, items.length]);

  useEffect(() => {
    const id = setInterval(scheduleRecompute, 800);
    return () => clearInterval(id);
  }, [scheduleRecompute]);

  const bg = moodForIndex(activeIdx, items.length);

  return (
    <div className="relative pb-2">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 transition-[background] duration-[850ms] ease-out"
        style={{ background: bg }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-55 transition-opacity duration-700"
        style={{
          background:
            "radial-gradient(ellipse 85% 50% at 50% 0%, rgba(255,248,238,0.16) 0%, transparent 55%)",
        }}
      />

      <DiscoverFilters neighborhoods={neighborhoods} chrome="espresso" />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-white/8 px-5 py-10 text-center backdrop-blur-[2px]">
          <p className="text-sm font-semibold text-gather-cream">
            {hasActiveFilters ? "No gatherings match" : "Nothing open right now"}
          </p>
          <p className="mt-1 text-xs text-gather-cream/55">
            {hasActiveFilters
              ? "Try loosening your filters."
              : "New gatherings drop regularly. Or host one from the Host tab."}
          </p>
        </div>
      ) : (
        <div
          ref={stripRef}
          className="-mx-4 flex snap-x snap-mandatory gap-10 overflow-x-auto px-5 pb-6 pt-2 [scrollbar-width:thin] sm:mx-0 sm:flex-wrap sm:justify-start sm:gap-x-12 sm:gap-y-16 sm:overflow-visible sm:px-0 sm:pb-2"
        >
          {items.map((data, i) => (
            <div
              key={data.id}
              data-discover-card
              className="shrink-0 snap-center sm:shrink"
            >
              <PolaroidCard {...data} scrapbookIndex={i} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
