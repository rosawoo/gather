"use client";

import { useEffect, useState } from "react";
import { PERSONALITY_PROMPTS } from "@/lib/prompts";

type Answer = { key: string; body: string };

function normalizeSlots(initial: Answer[]): [Answer, Answer, Answer] {
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
  const [slots, setSlots] = useState(() => normalizeSlots(initialAnswers));

  const answersKey = JSON.stringify(
    initialAnswers.map((a) => ({ key: a.key, body: a.body })),
  );

  useEffect(() => {
    setSlots(normalizeSlots(initialAnswers));
    // answersKey is a content digest; initialAnswers reference may change without content changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answersKey]);


  function patchSlot(idx: number, patch: Partial<Answer>) {
    setSlots((prev) => {
      const next = [...prev] as [Answer, Answer, Answer];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }

  return (
    <div className="space-y-5">
      {slots.map((slot, idx) => (
        <div key={idx} className="space-y-2">
          <label className="flex items-baseline gap-1.5 text-sm font-semibold uppercase tracking-[0.1em] text-gather-brown-mid">
            Prompt {idx + 1}
          </label>
          <select
            name={`prompt_slot_${idx}_key`}
            value={slot.key}
            onChange={(e) => patchSlot(idx, { key: e.target.value })}
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
            value={slot.body}
            onChange={(e) => patchSlot(idx, { body: e.target.value })}
            placeholder="Your answer"
            className={inputClassName}
          />
        </div>
      ))}
    </div>
  );
}
