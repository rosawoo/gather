"use client";

import { useMemo, useState } from "react";
import { MOOD_SLOT_COUNT, parseMoodBoardSlots } from "@/lib/mood-board";

const PALETTE = [
  "❤️",
  "⭐",
  "✨",
  "🌸",
  "☕",
  "🎉",
  "🌙",
  "☀️",
  "🍕",
  "🎵",
  "📷",
  "✏️",
];

export function MoodBoardEditor({
  initialDecorJson,
}: {
  initialDecorJson: string | null;
}) {
  const seed = useMemo(
    () => parseMoodBoardSlots(initialDecorJson),
    [initialDecorJson],
  );
  const [slots, setSlots] = useState<string[]>(seed);

  function setSlot(i: number, v: string) {
    setSlots((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
  }

  const json = JSON.stringify(slots);

  return (
    <div className="space-y-3">
      <input type="hidden" name="moodBoardDecor" value={json} />
      <p className="text-xs text-neutral-500">
        Tap a square to cycle stickers. They orbit your name and photo on your
        public profile.
      </p>
      <div className="grid grid-cols-4 gap-2">
        {slots.map((val, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              let curIdx = -1;
              if (val) {
                const ix = PALETTE.indexOf(val);
                curIdx = ix >= 0 ? ix : -1;
              }
              const nextIdx = (curIdx + 1) % (PALETTE.length + 1);
              setSlot(
                i,
                nextIdx >= PALETTE.length ? "" : PALETTE[nextIdx]!,
              );
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setSlot(i, "");
            }}
            className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-gather-paper/60 text-xl transition hover:border-gather-accent/50 hover:bg-white"
            title="Click to change · right-click or long-press to clear"
          >
            {val || <span className="text-xs text-neutral-400">+</span>}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-neutral-400">
        Right-click (desktop) a slot to clear. {MOOD_SLOT_COUNT} positions.
      </p>
    </div>
  );
}
