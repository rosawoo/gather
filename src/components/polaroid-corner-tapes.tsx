/**
 * Decorative washi-style tape shards for polaroid / scrapbook cards.
 * Absolutely positioned; expects a `relative` ancestor. `pointer-events-none`.
 */

const tapeStripe =
  "bg-[linear-gradient(106deg,rgb(255_248_240/0.97)_9%,rgb(241_219_187/0.86)_42%,rgb(232_207_173/0.9)_71%,rgb(245_229_207/0.94)_94%)]";
const tapeFx =
  "shadow-[inset_0_1px_0_rgb(255_255_253/0.58),0_3px_8px_-2px_rgb(52_34_26/0.32)] ring-[0.45px] ring-black/13";

function scrapbookTapeFilter(seed: number): string {
  const hue = ((seed * 37) % 55) - 22;
  const sat = 1.03 + ((seed >>> 3) % 140) / 1000;
  const bright = 0.975 + ((seed >>> 7) % 7) / 400;
  return `hue-rotate(${hue}deg) saturate(${sat.toFixed(3)}) brightness(${bright.toFixed(3)})`;
}

function scrapbookBradFilter(seed: number): string {
  const hue = (((seed + 17) * 41) % 46) - 20;
  return `hue-rotate(${hue}deg) saturate(${1.02 + (seed % 5) / 50}) brightness(${1.01 + ((seed >>> 5) % 5) / 200})`;
}

type CornerTapesProps = {
  /** Varies rotations / offsets slightly so cards don't look cloned. */
  seed: number;
  /** Polaroid backs have a chrome strip below the scroll pane; tuck bottom tapes upward. */
  placement?: "frame" | "flipBack";
};

export function PolaroidPhotoCornerTapes({ seed }: CornerTapesProps) {
  const j = seed % 5;
  const r0 = -44 - j * 0.6;
  const r1 = 41 + ((seed >> 2) % 3);
  const tapeSm =
    `pointer-events-none absolute z-[4] rounded-[2px] ${tapeStripe} ${tapeFx} ` +
    "h-[7px] w-[31px] backdrop-blur-[0.35px] sm:h-[8px] sm:w-[38px]";
  const fTape = scrapbookTapeFilter(seed);
  return (
    <>
      <span
        aria-hidden
        className={`${tapeSm} left-[6%] top-[7%]`}
        style={{ transform: `rotate(${r0}deg)`, filter: fTape }}
      />
      <span
        aria-hidden
        className={`${tapeSm} bottom-[10%] right-[5%] opacity-[0.88]`}
        style={{
          transform: `rotate(${r1}deg)`,
          filter: scrapbookTapeFilter(seed + 91),
        }}
      />
    </>
  );
}

export function PolaroidFrameCornerTapes({
  seed,
  placement = "frame",
}: CornerTapesProps) {
  const j = seed % 4;
  const rots = [-36 - j, 39 + j * 0.45, -(41 + j * 0.25), 34 - j * 0.65];
  const tapeMd =
    `pointer-events-none absolute z-[24] rounded-[2.5px] ${tapeStripe} ${tapeFx} ` +
    "h-[11px] w-[44px] backdrop-blur-[0.55px] sm:h-[12px] sm:w-[52px]";
  const spotsFrame = [
    "left-[2px] top-[6px]",
    "right-[2px] top-[10px]",
    "left-[3px] bottom-[18px]",
    "right-[3px] bottom-[14px]",
  ] as const;
  /** Sit above pinned CTAs inside the flipped-back layout. */
  const spotsFlip = [
    "left-[3px] top-[10px]",
    "right-[3px] top-[13px]",
    "left-[4px] bottom-[6.85rem]",
    "right-[4px] bottom-[6.95rem]",
  ] as const;
  const spots = placement === "flipBack" ? spotsFlip : spotsFrame;
  return (
    <>
      {spots.map((cls, i) => (
        <span
          key={i}
          aria-hidden
          className={`${tapeMd} ${cls}`}
          style={{
            transform: `rotate(${rots[i]}deg)`,
            filter: scrapbookTapeFilter(seed + i * 19 + (placement === "flipBack" ? 211 : 0)),
          }}
        />
      ))}
    </>
  );
}

/** Scrapbook brass brads past the bezel—use on the outer tilt wrapper. */
export function PolaroidScrapbookBrads({ seed }: { seed: number }) {
  const o = (seed % 4) - 1;
  const bradHue = scrapbookBradFilter(seed + 204);
  const bradHue2 = scrapbookBradFilter(seed ^ 511);
  const brad =
    "pointer-events-none absolute z-[28] rounded-full " +
    "bg-[radial-gradient(circle_at_32%_32%,rgb(255_246_229/0.96)_0%,rgb(214_173_118/0.82)_46%,rgb(132_94_54/0.88)_100%)] " +
    "shadow-[inset_-1px_-1px_2px_rgb(72_54_38/0.38),inset_1px_1px_1px_rgb(255_250_239/0.55),0_2px_6px_-1px_rgb(36_22_14/0.42)] " +
    "ring-[0.4px] ring-black/26";
  return (
    <>
      <span
        aria-hidden
        className={`${brad} left-[2px] top-[26px] h-[7px] w-[7px] sm:h-[8px] sm:w-[8px]`}
        style={{
          transform: `translate(${o * 1.25}px,-${Math.abs(o) * 0.6}px)`,
          filter: bradHue,
        }}
      />
      <span
        aria-hidden
        className={`${brad} bottom-[16px] right-[4px] h-[8px] w-[8px] opacity-[0.92] sm:h-[9px] sm:w-[9px]`}
        style={{
          transform: `translate(${-o * 1.25}px,${Math.abs(o) * 0.5}px)`,
          filter: bradHue2,
        }}
      />
    </>
  );
}

function polaroidDecklePath(seed: number, vh: number, w: number): string {
  const steps = 42;
  let path = "M 0 0";
  for (let i = 0; i <= steps; i++) {
    const y = (i / steps) * vh;
    const bump = ((((i ^ seed) * 31) >>> 5) % 10) / 28;
    const x =
      (i % 2 === 0 ? 6.5 + bump * 10 : 1.2 + bump * 9) + ((seed + i * 3) % 5) * 0.08;
    path += ` L ${Math.min(w - 0.2, Math.max(0.25, x)).toFixed(2)} ${y.toFixed(1)}`;
  }
  path += ` L 0 ${vh} Z`;
  return path;
}

/**
 * Torn-paper deckle along one long edge of the polaroid shell (alternates L/R by seed).
 */
export function PolaroidDeckledPaperEdge({
  seed,
  surface = "frame",
}: {
  seed: number;
  surface?: "frame" | "flipBack";
}) {
  const side = seed % 2 === 0 ? "left" : "right";
  const VH = 220;
  const W = 16;
  const d = polaroidDecklePath(seed + (surface === "flipBack" ? 31 : 0), VH, W);
  const bottomInset =
    surface === "flipBack" ? "bottom-[7.15rem]" : "bottom-[4.95rem]";
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${VH}`}
      preserveAspectRatio="none"
      className={`pointer-events-none absolute top-3 z-[3] w-[12px] opacity-[0.48] mix-blend-multiply sm:w-[14px] sm:opacity-[0.52] ${bottomInset} ${
        side === "left" ? "left-px" : "right-px scale-x-[-1]"
      }`}
    >
      <path
        d={d}
        fill="rgb(247 239 229 / 0.76)"
        stroke="rgb(86 71 61 / 0.11)"
        strokeWidth={0.35}
        strokeLinejoin="round"
        vectorEffect="nonScalingStroke"
      />
    </svg>
  );
}
