export const MOOD_SLOT_COUNT = 8;

export function parseMoodBoardSlots(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return Array(MOOD_SLOT_COUNT).fill("");
  try {
    const a = JSON.parse(raw) as unknown;
    if (!Array.isArray(a)) return Array(MOOD_SLOT_COUNT).fill("");
    return Array.from({ length: MOOD_SLOT_COUNT }, (_, i) => {
      const v = a[i];
      if (typeof v !== "string") return "";
      return v.trim().slice(0, 8);
    });
  } catch {
    return Array(MOOD_SLOT_COUNT).fill("");
  }
}

/** Normalize JSON from client hidden field before saving. */
export function normalizeMoodBoardDecorJson(raw: string | null | undefined): string {
  if (!raw?.trim()) return JSON.stringify(Array(MOOD_SLOT_COUNT).fill(""));
  return JSON.stringify(parseMoodBoardSlots(raw));
}
