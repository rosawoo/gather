import { MOOD_SLOT_COUNT, parseMoodBoardSlots } from "@/lib/mood-board";

const POS = [
  "left-[-6%] top-[8%] -rotate-[14deg] sm:left-[-4%]",
  "right-[-8%] top-[12%] rotate-[12deg] sm:right-[-5%]",
  "left-[10%] top-[-12%] -rotate-[6deg]",
  "right-[12%] top-[-10%] rotate-[8deg]",
  "left-[-4%] bottom-[18%] rotate-[10deg]",
  "right-[-6%] bottom-[22%] -rotate-[12deg]",
  "left-[18%] bottom-[-8%] -rotate-[8deg]",
  "right-[16%] bottom-[-6%] rotate-[14deg]",
] as const;

/** Decorative emoji layer around the profile hero (mood board mode). */
export function MoodBoardAura({ decorJson }: { decorJson: string | null }) {
  const slots = parseMoodBoardSlots(decorJson);
  const hasAny = slots.some(Boolean);
  if (!hasAny) return null;
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 overflow-visible"
      aria-hidden
    >
      {slots.slice(0, MOOD_SLOT_COUNT).map((glyph, i) =>
        glyph ? (
          <span
            key={i}
            className={`absolute text-[1.75rem] leading-none drop-shadow-md sm:text-[2.25rem] ${POS[i] ?? POS[0]}`}
          >
            {glyph}
          </span>
        ) : null,
      )}
    </div>
  );
}
