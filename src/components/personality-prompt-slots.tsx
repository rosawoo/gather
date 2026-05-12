"use client";

import { PERSONALITY_PROMPTS } from "@/lib/prompts";

type Answer = { key: string; body: string };

function slotsFromInitial(initial: Answer[]): [Answer, Answer, Answer] {
  const pad: Answer[] = initial.slice(0, 3).map((a) => ({
    key: a.key,
    body: a.body,
  }));
  while (pad.length < 3) pad.push({ key: "", body: "" });
  return [pad[0], pad[1], pad[2]];
}

export function PersonalityPromptSlots({
  initialAnswers = [],
  inputClassName,
}: {
  initialAnswers?: Answer[];
  inputClassName: string;
}) {
  const [a, b, c] = slotsFromInitial(initialAnswers);

  return (
    <div className="space-y-5">
      {[
        { slot: a, idx: 0 },
        { slot: b, idx: 1 },
        { slot: c, idx: 2 },
      ].map(({ slot, idx }) => (
        <div key={idx} className="space-y-2">
          <label className="flex items-baseline gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gather-brown-mid">
            Prompt {idx + 1}
          </label>
          <select
            name={`prompt_slot_${idx}_key`}
            defaultValue={slot.key}
            className={inputClassName}
          >
            <option value="">Pick a question…</option>
            {PERSONALITY_PROMPTS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
          <textarea
            name={`prompt_slot_${idx}_body`}
            rows={2}
            defaultValue={slot.body}
            placeholder="Your answer"
            className={inputClassName}
          />
        </div>
      ))}
    </div>
  );
}
