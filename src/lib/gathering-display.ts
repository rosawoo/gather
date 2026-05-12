import type { GatheringType } from "@prisma/client";

/** Short neighborhood for Polaroid captions, e.g. "Logan Circle, Washington, DC" → "logan circle". */
export function shortNeighborhoodForCaption(full: string): string {
  const s = full
    .replace(/,\s*Washington,?\s*DC$/i, "")
    .replace(/,\s*DC$/i, "")
    .trim();
  return s.toLowerCase();
}

/** Casual first line for Polaroid (e.g. dinner, logan circle). */
export function gatheringTypeCaptionLabel(type: GatheringType): string {
  switch (type) {
    case "HOME":
      return "dinner";
    case "PUBLIC":
      return "out";
    case "OTHER":
      return "gathering";
    default:
      return "gathering";
  }
}

/** Polaroid date stack: 05.19.26 */
export function formatPolaroidDate(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}.${dd}.${yy}`;
}

/** Capacity line for cards and detail (host friends optional). */
export function capacityLine(
  minTotal: number,
  maxTotal: number,
  hostFriendsCount: number,
): string {
  const base = `Capacity ${minTotal}–${maxTotal}`;
  if (hostFriendsCount > 0) {
    const f =
      hostFriendsCount === 1 ? "1 host friend" : `${hostFriendsCount} host friends`;
    return `${base} • ${f}`;
  }
  return base;
}

export function ageFromDob(dob: Date) {
  const t = new Date();
  let age = t.getFullYear() - dob.getFullYear();
  const m = t.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < dob.getDate())) age--;
  return age;
}
