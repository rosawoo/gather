"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { capacityLine, ageFromDob } from "@/lib/gathering-display";
import { CoverArt } from "@/components/cover-art";

export type PolaroidCardData = {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string | null;
  startsAt: string;
  neighborhood: string;
  minTotalSize: number;
  maxTotalSize: number;
  hostFriendsCount: number;
  tokenCost: number;
  hostImage: string | null;
  hostId: string;
  hostFirstName: string | null;
  hostDateOfBirth: string | null;
};

type PolaroidCardProps = PolaroidCardData & {
  scrapbookIndex?: number;
  /** Profile / static lists: links only, no flip. */
  variant?: "discover" | "static";
};

export function PolaroidCard(props: PolaroidCardProps) {
  const variant = props.variant ?? "discover";
  const [flipped, setFlipped] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const idx = props.scrapbookIndex;
  const tiltClass =
    idx !== undefined
      ? idx % 2 === 0
        ? "-rotate-[1.6deg]"
        : "rotate-[1.8deg]"
      : "-rotate-[1.2deg]";

  const startsAt = new Date(props.startsAt);
  const dateStr = startsAt.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const tokenLabel =
    props.tokenCost === 0
      ? "Free"
      : `${props.tokenCost} token${props.tokenCost === 1 ? "" : "s"}`;

  const hostLabel = props.hostFirstName?.trim() || "Host";
  const hostDob = props.hostDateOfBirth
    ? new Date(props.hostDateOfBirth)
    : null;
  const hostAge = hostDob != null ? ageFromDob(hostDob) : null;

  if (variant === "static") {
    return (
      <div
        className={`relative w-[min(100%,280px)] ${tiltClass} transition duration-300 hover:rotate-0 hover:scale-[1.02]`}
      >
        {idx !== undefined ? (
          <div
            aria-hidden
            className="absolute -top-2 left-1/2 z-20 h-4 w-[4.75rem] -translate-x-1/2 rotate-[2deg] rounded-[2px] bg-gradient-to-r from-[#f0e6d8]/95 via-white/90 to-[#e8dcc8]/95 shadow-md ring-1 ring-black/15"
          />
        ) : null}
        <div className="rounded-xl bg-white p-3 pb-14 shadow-lg shadow-black/10 ring-1 ring-black/[0.07] transition duration-300 hover:shadow-xl hover:ring-gather-accent/25">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gather-line/50">
            <CoverArt cover={props.coverImageUrl} title={props.title} />
            <Link
              href={`/gatherings/${props.id}`}
              className="absolute inset-0 z-0"
              aria-label={`Open gathering: ${props.title}`}
            />
            <span className="pointer-events-auto absolute bottom-2 right-2 z-[2] inline-flex rounded-full bg-gather-cream/95 px-2.5 py-0.5 text-[11px] font-semibold text-gather-brown shadow-sm ring-1 ring-black/5">
              {tokenLabel}
            </span>
            <Link
              href={`/u/${props.hostId}`}
              className="pointer-events-auto absolute bottom-2 left-2 z-[2] flex max-w-[min(100%,13rem)] items-center gap-2 rounded-lg bg-gather-cream/95 py-1 pl-1 pr-2 shadow-sm ring-1 ring-black/8 transition hover:bg-white"
              aria-label={`View ${hostLabel}'s profile`}
            >
              {props.hostImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={props.hostImage}
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 shrink-0 rounded-full object-cover ring-2 ring-white"
                />
              ) : (
                <div className="h-7 w-7 shrink-0 rounded-full bg-gather-line/55 ring-2 ring-white" />
              )}
              <span className="min-w-0 truncate text-left text-xs font-medium text-gather-ink">
                {hostLabel}
                {hostAge != null ? (
                  <span className="font-normal text-gather-charcoal/80">
                    {" "}
                    · {hostAge}
                  </span>
                ) : null}
              </span>
            </Link>
          </div>
          <Link
            href={`/gatherings/${props.id}`}
            className="group mt-3 block space-y-1.5 px-0.5"
          >
            <h3 className="font-handwriting line-clamp-2 text-[17px] font-medium leading-snug text-gather-ink transition-colors group-hover:text-gather-brown-mid">
              {props.title}
            </h3>
            <p className="text-xs font-medium text-gather-brown-mid/90">{dateStr}</p>
            <p className="text-xs text-gather-charcoal">{props.neighborhood}</p>
            <p className="text-xs text-gather-charcoal/80">
              {capacityLine(
                props.minTotalSize,
                props.maxTotalSize,
                props.hostFriendsCount,
              )}
            </p>
          </Link>
        </div>
      </div>
    );
  }

  function onCardClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("a,button")) return;
    setFlipped((f) => !f);
  }

  function onCardKeyDown(e: React.KeyboardEvent) {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setFlipped((f) => !f);
    }
  }

  const flipTransform = flipped ? "rotateY(180deg)" : "rotateY(0deg)";
  const transition = reduceMotion
    ? "none"
    : "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)";

  return (
    <div
      className={`relative w-[min(100%,280px)] ${tiltClass} transition duration-300 hover:rotate-0 hover:scale-[1.02]`}
    >
      {idx !== undefined ? (
        <div
          aria-hidden
          className="absolute -top-2 left-1/2 z-20 h-4 w-[4.75rem] -translate-x-1/2 rotate-[2deg] rounded-[2px] bg-gradient-to-r from-[#f0e6d8]/95 via-white/90 to-[#e8dcc8]/95 shadow-md ring-1 ring-black/15"
        />
      ) : null}

      <div className="polaroid-perspective min-h-[320px]">
        <div
          className="polaroid-preserve-3d relative min-h-[320px] w-full"
          style={{
            transform: flipTransform,
            transition,
          }}
        >
          <div
            role="button"
            tabIndex={0}
            aria-expanded={flipped}
            aria-label={`${props.title}. Press Enter to flip for details.`}
            onClick={onCardClick}
            onKeyDown={onCardKeyDown}
            className="polaroid-backface absolute inset-0 cursor-pointer rounded-xl bg-white p-3 pb-14 shadow-lg shadow-black/10 ring-1 ring-black/[0.07] transition duration-300 hover:shadow-xl hover:ring-gather-accent/25"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gather-line/50">
              <CoverArt cover={props.coverImageUrl} title={props.title} />
              <span className="pointer-events-auto absolute bottom-2 right-2 z-[2] inline-flex rounded-full bg-gather-cream/95 px-2.5 py-0.5 text-[11px] font-semibold text-gather-brown shadow-sm ring-1 ring-black/5">
                {tokenLabel}
              </span>
              <Link
                href={`/u/${props.hostId}`}
                onClick={(e) => e.stopPropagation()}
                className="pointer-events-auto absolute bottom-2 left-2 z-[2] flex max-w-[min(100%,13rem)] items-center gap-2 rounded-lg bg-gather-cream/95 py-1 pl-1 pr-2 shadow-sm ring-1 ring-black/8 transition hover:bg-white"
                aria-label={`View ${hostLabel}'s profile`}
              >
                {props.hostImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={props.hostImage}
                    alt=""
                    width={28}
                    height={28}
                    className="h-7 w-7 shrink-0 rounded-full object-cover ring-2 ring-white"
                  />
                ) : (
                  <div className="h-7 w-7 shrink-0 rounded-full bg-gather-line/55 ring-2 ring-white" />
                )}
                <span className="min-w-0 truncate text-left text-xs font-medium text-gather-ink">
                  {hostLabel}
                  {hostAge != null ? (
                    <span className="font-normal text-gather-charcoal/80">
                      {" "}
                      · {hostAge}
                    </span>
                  ) : null}
                </span>
              </Link>
            </div>
            <div className="mt-3 space-y-1.5 px-0.5">
              <h3 className="font-handwriting line-clamp-2 text-[17px] font-medium leading-snug text-gather-ink">
                {props.title}
              </h3>
              <p className="text-xs font-medium text-gather-brown-mid/90">{dateStr}</p>
              <p className="text-xs text-gather-charcoal">{props.neighborhood}</p>
              <p className="text-xs text-gather-charcoal/80">
                {capacityLine(
                  props.minTotalSize,
                  props.maxTotalSize,
                  props.hostFriendsCount,
                )}
              </p>
              <p className="pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gather-teal/90">
                Tap card for details
              </p>
            </div>
          </div>

          <div className="polaroid-face-back polaroid-backface absolute inset-0 flex min-h-[320px] flex-col rounded-xl bg-white p-4 shadow-lg shadow-black/10 ring-1 ring-gather-teal/20">
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-gather-teal">
              The vibe
            </p>
            <h3 className="mt-2 font-handwriting text-lg font-medium leading-snug text-gather-ink">
              {props.title}
            </h3>
            <p className="mt-2 line-clamp-6 text-sm leading-relaxed text-gather-charcoal">
              {props.description ||
                "The host will share more once you're connected."}
            </p>
            <ul className="mt-3 space-y-1.5 text-xs italic text-gather-charcoal/85">
              <li>Exact address after approval.</li>
              <li>Tokens held while the host reviews.</li>
            </ul>
            <div className="mt-auto flex flex-col gap-2 pt-4">
              <Link
                href={`/gatherings/${props.id}`}
                className="flex w-full items-center justify-center rounded-full bg-gather-wine py-3 text-center text-sm font-semibold text-gather-cream shadow-sm transition hover:bg-gather-charcoal"
              >
                View full details &amp; request
              </Link>
              <button
                type="button"
                onClick={() => setFlipped(false)}
                className="w-full rounded-full border border-gather-teal/35 py-2.5 text-sm font-semibold text-gather-teal transition hover:bg-gather-teal/10"
              >
                Flip back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
