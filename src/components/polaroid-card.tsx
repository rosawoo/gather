"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ageFromDob,
  capacityLine,
  formatPolaroidDate,
  gatheringTypeCaptionLabel,
  shortNeighborhoodForCaption,
} from "@/lib/gathering-display";
import { CoverArt } from "@/components/cover-art";
import {
  PolaroidDeckledPaperEdge,
  PolaroidScrapbookBrads,
} from "@/components/polaroid-corner-tapes";
import type { GatheringType } from "@prisma/client";

export type PolaroidCardData = {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string | null;
  startsAt: string;
  neighborhood: string;
  gatheringType: GatheringType;
  minTotalSize: number;
  maxTotalSize: number;
  hostFriendsCount: number;
  tokenCost: number;
  hostImage: string | null;
  hostId: string;
  hostFirstName: string | null;
  hostDateOfBirth: string | null;
  spotsLeft: number;
};

type PolaroidCardProps = PolaroidCardData & {
  scrapbookIndex?: number;
  /** Profile / static lists: links only, no flip. */
  variant?: "discover" | "static";
};

const POLAROID_FRAME =
  "rounded-sm bg-lc-polaroid-shell p-[14px] pb-12 shadow-[0_20px_44px_rgba(0,0,0,0.35)] ring-1 ring-black/10";

function polaroidTapeSeed(props: PolaroidCardProps): number {
  if (props.scrapbookIndex !== undefined) return props.scrapbookIndex;
  let h = 0;
  for (let i = 0; i < props.id.length; i++) {
    h = (h + props.id.charCodeAt(i) * (i + 13)) % 997;
  }
  return h;
}

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
        ? "-rotate-[1.2deg]"
        : "rotate-[1.4deg]"
      : "-rotate-[1deg]";

  const startsAt = new Date(props.startsAt);
  const dateCaption = formatPolaroidDate(startsAt);
  const dateTimeDetail = `${startsAt.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })} · ${startsAt.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })}`;

  const typeLine = `${gatheringTypeCaptionLabel(props.gatheringType)}, ${shortNeighborhoodForCaption(props.neighborhood)}`;

  const hostLabel = props.hostFirstName?.trim() || "Host";
  const hostDob = props.hostDateOfBirth
    ? new Date(props.hostDateOfBirth)
    : null;
  const hostAge = hostDob != null ? ageFromDob(hostDob) : null;
  /** Short label beside photo: always link to profile, stop card flip propagation. */
  const hostHref = `/u/${props.hostId}`;
  const tapeSeed = polaroidTapeSeed(props);

  if (variant === "static") {
    const tokenLabel =
      props.tokenCost === 0
        ? "free"
        : `${props.tokenCost} token${props.tokenCost === 1 ? "" : "s"}`;
    return (
      <div
        className={`relative w-[min(100%,320px)] ${tiltClass} transition duration-300 hover:rotate-0 hover:scale-[1.02]`}
      >
        <PolaroidScrapbookBrads seed={tapeSeed ^ 3} />
        <div className={`relative overflow-visible ${POLAROID_FRAME}`}>
          <PolaroidDeckledPaperEdge seed={tapeSeed ^ 137} />
          <div className="relative aspect-square w-full overflow-hidden rounded-[2px] bg-lc-photo-placeholder">
            <CoverArt cover={props.coverImageUrl} title={props.title} />
            <Link
              href={`/gatherings/${props.id}`}
              className="absolute inset-0 z-0"
              aria-label={`Open gathering: ${props.title}`}
            />
            <span className="pointer-events-none absolute bottom-2 right-2 z-[5] inline-flex rounded-full bg-lc-cream/95 px-2 py-0.5 font-handwriting text-[13px] text-lc-ink-on-paper shadow-sm ring-1 ring-black/8">
              {tokenLabel}
            </span>
          </div>
          <Link
            href={`/gatherings/${props.id}`}
            className="mt-4 block space-y-0.5 px-0.5"
          >
            <p className="font-handwriting text-[1.15rem] leading-snug text-lc-writing-ink">
              {typeLine}
            </p>
            <p className="font-handwriting text-[1.35rem] text-lc-writing-ink/90">
              {dateCaption}
            </p>
          </Link>
          <Link
            href={hostHref}
            className="mt-3 flex items-center gap-2.5 px-0.5 transition hover:opacity-90"
          >
            {props.hostImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={props.hostImage}
                alt={`${hostLabel} profile`}
                className="pointer-events-none h-10 w-10 shrink-0 rounded-full object-cover shadow-md ring-2 ring-lc-cream/80"
              />
            ) : (
              <div className="pointer-events-none h-10 w-10 shrink-0 rounded-full bg-lc-earth-muted/35 ring-2 ring-lc-cream/70" />
            )}
            <span className="min-w-0 text-left font-serif text-[15px] font-medium leading-snug tracking-wide text-lc-writing-ink">
              {hostLabel}
              {hostAge != null ? (
                <>
                  {" "}
                  · {hostAge} yrs
                </>
              ) : null}
            </span>
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
    : "transform 0.62s cubic-bezier(0.42, 0, 0.18, 1)";

  const spotsPhrase =
    props.spotsLeft <= 0
      ? "full; waitlist vibes only"
      : `${props.spotsLeft} spot${props.spotsLeft === 1 ? "" : "s"} open`;

  return (
    <div
      className={`relative w-[min(92vw,360px)] ${tiltClass} transition duration-300 hover:rotate-0`}
    >
      <PolaroidScrapbookBrads seed={tapeSeed ^ 3} />
      <div className="polaroid-perspective w-full px-px">
        <div
          className="polaroid-preserve-3d relative h-[min(558px,86dvh)] w-full rounded-sm"
          style={{
            transform: flipTransform,
            transition,
          }}
        >
          {/* Front: candid + handwritten caption */}
          <div
            role="button"
            tabIndex={0}
            aria-expanded={flipped}
            aria-label={`${props.title}. Flip for details.`}
            onClick={onCardClick}
            onKeyDown={onCardKeyDown}
            className={`polaroid-backface absolute inset-0 cursor-pointer overflow-visible ${POLAROID_FRAME}`}
          >
            <PolaroidDeckledPaperEdge seed={tapeSeed ^ 241} />
            <div className="relative aspect-square w-full overflow-hidden rounded-[2px] bg-lc-photo-placeholder">
              <CoverArt cover={props.coverImageUrl} title={props.title} />
            </div>
            <div className="mt-4 space-y-1 px-0.5">
              <p className="font-handwriting text-[1.2rem] leading-snug text-lc-writing-ink">
                {typeLine}
              </p>
              <p className="font-handwriting text-[1.45rem] text-lc-writing-ink/92">
                {dateCaption}
              </p>
              <Link
                href={hostHref}
                onClick={(e) => e.stopPropagation()}
                className="mt-3 flex items-center gap-2.5 px-0.5 transition hover:opacity-90 focus-visible:outline focus-visible:ring-2 focus-visible:ring-lc-dusty-blue/55"
              >
                {props.hostImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={props.hostImage}
                    alt={`${hostLabel} profile`}
                    className="h-11 w-11 shrink-0 rounded-full object-cover shadow-md ring-2 ring-lc-cream/80"
                  />
                ) : (
                  <div className="h-11 w-11 shrink-0 rounded-full bg-lc-earth-muted/35 ring-2 ring-lc-cream/70" />
                )}
                <span className="font-serif text-[15px] font-medium leading-snug tracking-wide text-lc-writing-ink">
                  {hostLabel}
                  {hostAge != null ? ` · ${hostAge} yrs` : ""}
                </span>
              </Link>
              <p className="mt-3 font-handwriting text-[1.2rem] leading-snug lowercase tracking-[0.02em] text-lc-earth-muted italic">
                turn over for details
              </p>
            </div>
          </div>

          {/* Back: readable scroll region + pinned CTAs */}
          <div className="polaroid-face-back polaroid-backface absolute inset-0 flex flex-col overflow-hidden rounded-sm bg-lc-polaroid-shell text-lc-writing-ink shadow-[0_20px_44px_rgba(0,0,0,0.35)] ring-1 ring-black/10">
            <PolaroidDeckledPaperEdge
              seed={tapeSeed ^ 409}
              surface="flipBack"
            />
            <div
              role="region"
              aria-label="Gathering details"
              className="polaroid-card-back-scroll relative min-h-0 flex-1 touch-pan-y overflow-y-auto px-6 pb-6 pt-6"
            >
              <p className="font-handwriting text-[1.15rem] font-normal lowercase leading-none tracking-wide italic text-lc-muted-tan">
                the evening
              </p>
              <h3 className="mt-4 font-handwriting text-2xl font-medium leading-[1.2] tracking-tight text-lc-writing-ink">
                {props.title}
              </h3>
              <p className="mt-5 text-[15px] leading-[1.55] text-lc-writing-ink">
                {props.description ||
                  "The host will share more once you’re connected."}
              </p>

              <div className="mt-7 border-t border-lc-pale-blue-border/80 pt-6 font-serif leading-[1.55]">
                <p className="text-[15px] leading-[1.55]">
                  <span className="font-semibold text-lc-ink-on-paper">
                    Host ·{" "}
                  </span>
                  <span className="font-medium text-lc-writing-ink">
                    {hostLabel}
                    {hostAge != null ? ` · ${hostAge} yrs` : ""}
                  </span>
                </p>
                <p className="mt-2.5 text-[15px] leading-[1.55]">
                  <span className="font-semibold text-lc-ink-on-paper">
                    Where ·{" "}
                  </span>
                  <span className="font-medium text-lc-writing-ink">{props.neighborhood}</span>
                </p>
                <p className="mt-2.5 text-[15px] leading-[1.55]">
                  <span className="font-semibold text-lc-ink-on-paper">
                    When ·{" "}
                  </span>
                  <span className="font-medium text-lc-writing-ink">{dateTimeDetail}</span>
                </p>
                <p className="mt-2.5 text-[15px] leading-[1.55]">
                  <span className="font-semibold text-lc-ink-on-paper">
                    Room ·{" "}
                  </span>
                  <span className="font-medium text-lc-writing-ink">{spotsPhrase}</span>
                  <span className="font-semibold text-lc-ink-on-paper"> · </span>
                  <span className="font-medium text-lc-writing-ink">
                    {capacityLine(
                      props.minTotalSize,
                      props.maxTotalSize,
                      props.hostFriendsCount,
                    )}
                  </span>
                </p>
              </div>
            </div>

            <div className="relative z-[34] shrink-0 border-t border-lc-pale-blue-border/65 bg-gradient-to-t from-transparent from-0% via-lc-cream/90 via-[28%] to-lc-cream px-6 pb-5 pt-5 shadow-[0_-12px_32px_-16px_rgb(43_22_15_/_0.14)]">
              <div className="flex flex-col gap-2.5">
                <Link
                  href={`/gatherings/${props.id}#join`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex w-full items-center justify-center rounded-lg border border-lc-warm-shadow/25 bg-lc-dusty-blue px-4 py-3.5 text-center font-serif text-base font-medium lowercase tracking-[0.12em] text-lc-cream shadow-sm transition hover:bg-lc-dusty-blue-bright-hover"
                >
                  request to join
                </Link>
                <Link
                  href={`/u/${props.hostId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-center font-serif text-[13px] font-medium lowercase tracking-wide text-lc-dusty-blue underline decoration-lc-dusty-blue/55 underline-offset-4 hover:text-lc-deep-brown hover:decoration-lc-dusty-blue"
                >
                  view {hostLabel}&apos;s profile
                </Link>
                <button
                  type="button"
                  onClick={() => setFlipped(false)}
                  className="w-full rounded-lg border border-lc-writing-ink/25 bg-lc-cream/30 py-3 font-serif text-[15px] font-medium lowercase tracking-wide text-lc-control-brown backdrop-blur-[1px] transition hover:bg-lc-cream/55"
                >
                  flip back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
