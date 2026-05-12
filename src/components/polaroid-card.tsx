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
  "rounded-sm bg-[#f2ebe3] p-[14px] pb-12 shadow-[0_20px_44px_rgba(0,0,0,0.35)] ring-1 ring-black/10";

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

  const tokenLabel =
    props.tokenCost === 0
      ? "free"
      : `${props.tokenCost} token${props.tokenCost === 1 ? "" : "s"}`;

  const hostLabel = props.hostFirstName?.trim() || "Host";
  const hostDob = props.hostDateOfBirth
    ? new Date(props.hostDateOfBirth)
    : null;
  const hostAge = hostDob != null ? ageFromDob(hostDob) : null;

  if (variant === "static") {
    return (
      <div
        className={`relative w-[min(100%,320px)] ${tiltClass} transition duration-300 hover:rotate-0 hover:scale-[1.02]`}
      >
        <div className={POLAROID_FRAME}>
          <div className="relative aspect-square w-full overflow-hidden rounded-[2px] bg-[#ddd5cc]">
            <CoverArt cover={props.coverImageUrl} title={props.title} />
            <Link
              href={`/gatherings/${props.id}`}
              className="absolute inset-0 z-0"
              aria-label={`Open gathering: ${props.title}`}
            />
            <span className="pointer-events-none absolute bottom-2 right-2 z-[2] inline-flex rounded-full bg-[#f4eee7]/95 px-2 py-0.5 font-handwriting text-[13px] text-[#3a1a0f] shadow-sm ring-1 ring-black/8">
              {tokenLabel}
            </span>
          </div>
          <Link
            href={`/gatherings/${props.id}`}
            className="mt-4 block space-y-0.5 px-0.5"
          >
            <p className="font-handwriting text-[1.15rem] leading-snug text-[#2c1810]">
              {typeLine}
            </p>
            <p className="font-handwriting text-[1.35rem] text-[#2c1810]/90">
              {dateCaption}
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
    : "transform 0.62s cubic-bezier(0.42, 0, 0.18, 1)";

  const spotsPhrase =
    props.spotsLeft <= 0
      ? "full; waitlist vibes only"
      : `${props.spotsLeft} spot${props.spotsLeft === 1 ? "" : "s"} open`;

  return (
    <div
      className={`relative w-[min(92vw,360px)] ${tiltClass} transition duration-300 hover:rotate-0`}
    >
      <div className="polaroid-perspective min-h-[400px]">
        <div
          className="polaroid-preserve-3d relative min-h-[400px] w-full"
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
            className={`polaroid-backface absolute inset-0 cursor-pointer ${POLAROID_FRAME}`}
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-[2px] bg-[#ddd5cc]">
              <CoverArt cover={props.coverImageUrl} title={props.title} />
            </div>
            <div className="mt-4 space-y-1 px-0.5">
              <p className="font-handwriting text-[1.2rem] leading-snug text-[#2c1810]">
                {typeLine}
              </p>
              <p className="font-handwriting text-[1.45rem] text-[#2c1810]/92">
                {dateCaption}
              </p>
              <p className="pt-2 font-serif text-[11px] font-medium uppercase tracking-[0.14em] text-[#266b7e]/90">
                Turn over for details
              </p>
            </div>
          </div>
    
          {/* Back: editorial + request */}
          <div
            className="polaroid-face-back polaroid-backface absolute inset-0 flex min-h-[400px] flex-col rounded-sm bg-[#f2ebe3] p-4 pb-5 shadow-[0_20px_44px_rgba(0,0,0,0.35)] ring-1 ring-black/10"
          >
            <p className="font-serif text-[11px] font-semibold uppercase tracking-[0.16em] text-[#266b7e]">
              The evening
            </p>
            <h3 className="mt-2 font-handwriting text-xl font-medium leading-snug text-[#2c1810]">
              {props.title}
            </h3>
            <p className="mt-2 flex-1 overflow-y-auto text-sm leading-relaxed text-[#3d2a22]">
              {props.description ||
                "The host will share more once you’re connected."}
            </p>

            <div className="mt-3 space-y-1.5 border-t border-[#c6d8e3]/55 pt-3 font-serif text-[13px] leading-snug text-[#3d2a22]">
              <p>
                <span className="text-[#6b5348]">Host · </span>
                {hostLabel}
                {hostAge != null ? `, ${hostAge}` : ""}
              </p>
              <p>
                <span className="text-[#6b5348]">Where · </span>
                {props.neighborhood}
              </p>
              <p>
                <span className="text-[#6b5348]">When · </span>
                {dateTimeDetail}
              </p>
              <p>
                <span className="text-[#6b5348]">Room · </span>
                {spotsPhrase}
                <span className="text-[#6b5348]"> · </span>
                <span className="text-[#5c4a42]">
                  {capacityLine(
                    props.minTotalSize,
                    props.maxTotalSize,
                    props.hostFriendsCount,
                  )}
                </span>
              </p>
              <p className="text-xs text-[#6b5348]">
                Tokens: {tokenLabel} · exact address after approval
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Link
                href={`/gatherings/${props.id}#join`}
                onClick={(e) => e.stopPropagation()}
                className="flex w-full items-center justify-center rounded-md border border-[#c6d8e3] bg-[#266b7e] py-3 text-center font-serif text-[15px] font-medium lowercase tracking-[0.14em] text-[#f4eee7] shadow-sm transition hover:bg-[#2f7f95]"
              >
                request to join
              </Link>
              <Link
                href={`/u/${props.hostId}`}
                onClick={(e) => e.stopPropagation()}
                className="text-center font-serif text-xs lowercase tracking-wide text-[#266b7e] underline decoration-[#266b7e]/40 underline-offset-4 hover:decoration-[#266b7e]"
              >
                view {hostLabel}&apos;s profile
              </Link>
              <button
                type="button"
                onClick={() => setFlipped(false)}
                className="w-full rounded-md border border-[#6b5348]/35 py-2 font-serif text-sm lowercase tracking-wide text-[#4a342c] transition hover:bg-[#f2ebe3]"
              >
                flip back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
