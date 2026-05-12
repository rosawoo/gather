export const PERSONALITY_PROMPTS = [
  { key: "sunday", label: "My ideal Sunday looks like…" },
  { key: "controversial", label: "My most controversial opinion is…" },
  { key: "billion", label: "If I had a billion dollars I would…" },
  {
    key: "skill_competition",
    label: "A random skill I\u2019d dominate a competition in is…",
  },
  { key: "heart", label: "The quickest way to my heart is…" },
  { key: "roman_empire", label: "My Roman Empire is…" },
  {
    key: "fun_fact",
    label: "A fun fact that sounds fake about me but is true…",
  },
  { key: "athlete", label: "My favorite athlete is…" },
  {
    key: "hobby_obsession",
    label: "The hobby I randomly got obsessed with recently…",
  },
  { key: "show", label: "One show I think everyone should watch…" },
] as const;

export type PersonalityPromptKey = (typeof PERSONALITY_PROMPTS)[number]["key"];

const KEY_SET = new Set<string>(PERSONALITY_PROMPTS.map((p) => p.key));

/**
 * Parse three optional slots from onboarding / edit profile forms.
 * Enforces: at least two complete slots, distinct questions, no half-filled rows.
 */
export function parsePersonalitySlots(formData: FormData): {
  key: string;
  body: string;
}[] {
  const filled: { key: string; body: string }[] = [];

  for (let i = 0; i < 3; i++) {
    const key = String(formData.get(`prompt_slot_${i}_key`) ?? "").trim();
    const body = String(formData.get(`prompt_slot_${i}_body`) ?? "").trim();

    if (!key && !body) continue;

    if (!key || !body) {
      throw new Error(
        `For prompt ${i + 1}, choose a question and write an answer, or clear both.`,
      );
    }

    if (!KEY_SET.has(key)) {
      throw new Error("Each line needs a valid question from the list.");
    }

    filled.push({ key, body });
  }

  if (filled.length < 2) {
    throw new Error("Answer at least two personality prompts.");
  }

  const keys = filled.map((f) => f.key);
  if (new Set(keys).size !== keys.length) {
    throw new Error("Use a different question for each prompt you fill in.");
  }

  return filled;
}
