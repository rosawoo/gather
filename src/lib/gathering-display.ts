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
