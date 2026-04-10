/** Normalize user input to E.164 for Twilio (US + international with +). */
export function normalizeToE164(raw: string): string {
  const t = raw.trim();
  const digits = t.replace(/\D/g, "");

  if (t.startsWith("+")) {
    if (digits.length < 10) throw new Error("Phone number too short");
    return `+${digits}`;
  }

  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;

  throw new Error(
    "Use a 10-digit US number or include country code with + (e.g. +44…)",
  );
}
