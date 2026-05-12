"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DiscoverFilters } from "@/components/discover-filters";
import { PolaroidCard, type PolaroidCardData } from "@/components/polaroid-card";

/** Background washes that follow the centered Polaroid (scroll / arrows). */
const MOOD_BACKGROUNDS = [
  "linear-gradient(165deg, #1a0a06 0%, #2d1510 45%, #120705 100%)",
  "linear-gradient(165deg, #2a0c12 0%, #5c1f28 48%, #1a080c 100%)",
  "linear-gradient(165deg, #0c1f18 0%, #1a4d3d 42%, #081210 100%)",
  "linear-gradient(165deg, #3a1a08 0%, #b84a1a 40%, #1f0d05 100%)",
  "linear-gradient(165deg, #1e1028 0%, #4a2a58 45%, #120818 100%)",
  "linear-gradient(165deg, #280812 0%, #6b1a32 46%, #16040a 100%)",
] as const;

function moodForIndex(i: number, len: number) {
  if (len <= 0) return MOOD_BACKGROUNDS[0];
  return MOOD_BACKGROUNDS[i % MOOD_BACKGROUNDS.length];
}

function CarouselArrow({
  dir,
  label,
  onClick,
  disabled,
}: {
  dir: "prev" | "next";
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="z-20 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#f4eee7]/45 bg-[#1a0a06]/55 text-[#f4eee7] shadow-md backdrop-blur-sm transition hover:border-[#f4eee7]/70 hover:bg-[#1a0a06]/75 disabled:pointer-events-none disabled:opacity-35"
    >
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-6 w-6"
        aria-hidden
      >
        {dir === "prev" ? (
          <path
            fillRule="evenodd"
            d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
            clipRule="evenodd"
          />
        ) : (
          <path
            fillRule="evenodd"
            d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        )}
      </svg>
    </button>
  );
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

    const rootRect = root.getBoundingClientRect();
    const centerX = rootRect.left + rootRect.width / 2;

    let best = 0;
    let bestScore = Infinity;

    cards.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const midX = r.left + r.width / 2;
      const score = Math.abs(midX - centerX);
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
    window.addEventListener("resize", scheduleRecompute);
    const ro = new ResizeObserver(scheduleRecompute);
    ro.observe(root);

    return () => {
      root.removeEventListener("scroll", scheduleRecompute);
      window.removeEventListener("resize", scheduleRecompute);
      ro.disconnect();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [scheduleRecompute, items.length]);

  const scrollStep = useCallback(() => {
    const root = stripRef.current;
    if (!root) return 0;
    const card = root.querySelector("[data-discover-card]") as HTMLElement | null;
    if (!card) return Math.min(root.clientWidth * 0.88, 400);
    const gap =
      parseFloat(getComputedStyle(root).columnGap || "0") ||
      parseFloat(getComputedStyle(root).gap || "40") ||
      40;
    return card.offsetWidth + gap;
  }, []);

  const scrollPrev = useCallback(() => {
    stripRef.current?.scrollBy({
      left: -scrollStep(),
      behavior: "smooth",
    });
  }, [scrollStep]);

  const scrollNext = useCallback(() => {
    stripRef.current?.scrollBy({
      left: scrollStep(),
      behavior: "smooth",
    });
  }, [scrollStep]);

  const bg = moodForIndex(activeIdx, items.length);
  const empty = items.length === 0;

  return (
    <div className="relative pb-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 transition-[background] duration-[900ms] ease-out"
        style={{ background: bg }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.42] transition-opacity duration-700"
        style={{
          background:
            "radial-gradient(ellipse 88% 58% at 50% 0%, rgba(255,248,238,0.14) 0%, transparent 55%)",
        }}
      />

      <DiscoverFilters neighborhoods={neighborhoods} chrome="espresso" />

      {empty ? (
        <div className="rounded-2xl border border-dashed border-white/18 bg-black/15 px-5 py-12 text-center backdrop-blur-[2px]">
          <p className="text-sm font-medium text-[#f4eee7]">
            {hasActiveFilters ? "No gatherings match" : "Nothing open right now"}
          </p>
          <p className="mt-2 text-xs text-[#f4eee7]/55">
            {hasActiveFilters
              ? "Try loosening your filters."
              : "New gatherings drop regularly, or host one from the Host tab."}
          </p>
        </div>
      ) : (
        <div className="relative flex items-center gap-2 sm:gap-4">
          <CarouselArrow
            dir="prev"
            label="Previous gathering"
            onClick={scrollPrev}
            disabled={items.length <= 1 || activeIdx === 0}
          />
          <div
            ref={stripRef}
            className="flex min-h-[min(76vh,520px)] flex-1 snap-x snap-mandatory gap-10 overflow-x-auto overflow-y-visible py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div
              className="w-[min(28vw,7.5rem)] max-w-[180px] shrink-0 sm:w-[min(22vw,6rem)]"
              aria-hidden
            />
            {items.map((data, i) => (
              <div
                key={data.id}
                data-discover-card
                className="flex shrink-0 snap-center justify-center"
                style={{ minWidth: "min(92vw, 360px)" }}
              >
                <PolaroidCard {...data} scrapbookIndex={i} />
              </div>
            ))}
            <div
              className="w-[min(28vw,7.5rem)] max-w-[180px] shrink-0 sm:w-[min(22vw,6rem)]"
              aria-hidden
            />
          </div>
          <CarouselArrow
            dir="next"
            label="Next gathering"
            onClick={scrollNext}
            disabled={items.length <= 1 || activeIdx >= items.length - 1}
          />
        </div>
      )}
    </div>
  );
}
