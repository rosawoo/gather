/**
 * Scrapbook-style chrome for polaroid cards: brads + optional deckled edge.
 * Absolutely positioned; expects a `relative` ancestor. `pointer-events-none`.
 */

function scrapbookBradFilter(seed: number): string {
  const hue = (((seed + 17) * 41) % 46) - 20;
  return `hue-rotate(${hue}deg) saturate(${1.02 + (seed % 5) / 50}) brightness(${1.01 + ((seed >>> 5) % 5) / 200})`;
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
