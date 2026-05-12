export const PERSONALITY_PROMPTS = [
  { key: "sunday", label: "My ideal Sunday looks like…" },
  { key: "controversial", label: "My most controversial opinion is…" },
  { key: "billion", label: "If I had a billion dollars I would…" },
  { key: "skill_competition", label: "A random skill I'd dominate a competition in is…" },
  { key: "heart", label: "The quickest way to my heart is…" },
  { key: "roman_empire", label: "My Roman Empire is…" },
  { key: "fun_fact", label: "A fun fact that sounds fake about me but is true…" },
  { key: "athlete", label: "My favorite athlete is…" },
  { key: "hobby_obsession", label: "The hobby I randomly got obsessed with recently…" },
  { key: "show", label: "One show I think everyone should watch…" },
] as const;

export type PersonalityPromptKey = (typeof PERSONALITY_PROMPTS)[number]["key"];

const KEY_SET = new Set<string>(
  PERSONALITY_PROMPTS.map((p) => p.key),
);

/** Parse three optional slots from onboarding / edit profile forms. */
export function parsePersonalitySlots(formData: FormData): {
  key: string;
  body: string;
}[] {
  const merged = new Map<string, string>();
  for (let i = 0; i < 3; i++) {
    const key = String(formData.get(`prompt_slot_${i}_key`) ?? "").trim();
    const body = String(formData.get(`prompt_slot_${i}_body`) ?? "").trim();
    if (!key || !body) continue;
    if (!KEY_SET.has(key)) continue;
    merged.set(key, body);
  }
  return Array.from(merged.entries()).map(([key, body]) => ({ key, body }));
}
