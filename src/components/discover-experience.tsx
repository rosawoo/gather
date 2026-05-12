"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DiscoverFilters } from "@/components/discover-filters";
import { PolaroidCard, type PolaroidCardData } from "@/components/polaroid-card";
import { lcChrome } from "@/lib/lc-classes";

/** Inline gradient stops mirror `:root` candlelit hues (brown, muted rust, plum, amber). */
const MOOD_BACKGROUNDS = [
  "linear-gradient(165deg, #230b04 0%, #3d1808 45%, #120602 100%)",
  "linear-gradient(165deg, #221410 0%, #5a3f36 42%, #120a08 100%)",
  "linear-gradient(165deg, #291012 0%, #4f2130 46%, #150608 100%)",
  "linear-gradient(165deg, #33220c 0%, #664218 38%, #1a0f06 100%)",
  "linear-gradient(165deg, #17102a 0%, #362c5c 45%, #0d0818 100%)",
  "linear-gradient(165deg, #38121c 0%, #663040 42%, #120408 100%)",
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
      className={`z-20 flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${lcChrome.roundControlIdle} disabled:pointer-events-none disabled:opacity-35`}
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

      <DiscoverFilters neighborhoods={neighborhoods} chrome="candlelit" />

      {!empty ? (
        <p className="mb-1 font-handwriting text-center text-[1.05rem] leading-snug lowercase tracking-[0.02em] text-lc-cream/[0.78] sm:text-[1.1rem]">
          flip through postcards left to right
        </p>
      ) : null}

      {empty ? (
        <div className="rounded-2xl border border-dashed border-lc-pale-blue-border/20 bg-lc-chip-surface px-5 py-12 text-center backdrop-blur-[2px]">
          <p className={`text-sm font-medium ${lcChrome.body}`}>
            {hasActiveFilters ? "No gatherings match" : "Nothing open right now"}
          </p>
          <p className={`mt-2 text-sm leading-relaxed ${lcChrome.mutedBody}`}>
            {hasActiveFilters
              ? "Try loosening your filters."
              : "New gatherings drop regularly, or host one from the Host tab."}
          </p>
        </div>
      ) : (
        <>
          <div className="relative flex items-center gap-2 sm:gap-4">
            <CarouselArrow
              dir="prev"
              label="Previous gathering"
              onClick={scrollPrev}
              disabled={items.length <= 1 || activeIdx === 0}
            />
            <div
              ref={stripRef}
              className="scrapbook-drag flex min-h-[min(592px,min(84vh,640px))] flex-1 snap-x snap-mandatory gap-[2.125rem] overflow-x-auto overflow-y-visible border-y border-dashed border-white/10 bg-[repeating-linear-gradient(105deg,rgb(255_248_239/0.02)_0_12px,rgb(0_0_0/0.02)_12px_14px)] py-8 pl-[min(3vw,1.75rem)] pr-[min(6vw,4rem)] [scrollbar-width:none] sm:gap-14 sm:border-x sm:border-white/14 sm:border-dashed sm:py-6 sm:pl-[min(6vw,3.5rem)] sm:pr-[min(10vw,6rem)] sm:rounded-sm [&::-webkit-scrollbar]:hidden"
            >
              <div
                className="w-[min(14vw,3.75rem)] max-w-[96px] shrink-0 sm:w-[min(18vw,5rem)]"
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
                className="w-[min(22vw,5.25rem)] max-w-[120px] shrink-0 sm:w-[min(16vw,4.25rem)]"
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
          <div className="mx-auto mt-10 max-w-2xl space-y-3 px-3 text-center text-[13px] leading-[1.5] text-lc-earth-muted">
            <p className="text-lc-caption-warm/88">
              *By requesting gatherings with token costs, you acknowledge funds
              are for shared reimbursements—not host profit. Tokens stay on hold
              while the host reviews whether you&apos;re a match.
            </p>
            <p className="italic text-lc-earth-muted">
              Hosting? *By publishing, you affirm collected funds cover real shared
              costs—not personal profit (see{" "}
              <Link
                href="/terms-of-service"
                className="font-semibold text-lc-tan-accent underline-offset-4 hover:underline"
              >
                Terms
              </Link>
              ).
            </p>
          </div>
        </>
      )}
    </div>
  );
}
