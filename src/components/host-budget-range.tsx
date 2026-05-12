"use client";

import { useEffect, useState } from "react";

const DOLLARS_PER_TOKEN = 7.5;
const MAX_TOKENS = 5;

function payingGuestSlots(
  minTotal: number,
  maxTotal: number,
  hostFriends: number,
): { min: number; max: number } {
  const minGuests = Math.max(0, minTotal - 1 - hostFriends);
  const maxGuests = Math.max(0, maxTotal - 1 - hostFriends);
  return { min: minGuests, max: maxGuests };
}

export function HostBudgetRange({ formId }: { formId: string }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const el = document.getElementById(formId);
    if (!el) return;
    const formEl: HTMLElement = el;

    function read() {
      const rawToken = Number(
        (formEl.querySelector('[name="tokenCost"]') as HTMLInputElement)
          ?.value ?? 0,
      );
      const tokenCost = Math.min(
        MAX_TOKENS,
        Number.isFinite(rawToken) ? Math.max(0, rawToken) : 0,
      );
      const minTotal = Number(
        (formEl.querySelector('[name="minTotalSize"]') as HTMLInputElement)
          ?.value ?? 0,
      );
      const maxTotal = Number(
        (formEl.querySelector('[name="maxTotalSize"]') as HTMLInputElement)
          ?.value ?? 0,
      );
      const hostFriends = Number(
        (formEl.querySelector('[name="hostFriendsCount"]') as HTMLInputElement)
          ?.value ?? 0,
      );

      if (!Number.isFinite(tokenCost) || tokenCost <= 0) {
        setLabel("No token budget. This gathering is free to join.");
        return;
      }

      const { min, max } = payingGuestSlots(
        Number.isFinite(minTotal) ? minTotal : 0,
        Number.isFinite(maxTotal) ? maxTotal : 0,
        Number.isFinite(hostFriends) ? hostFriends : 0,
      );
      const low = min * tokenCost * DOLLARS_PER_TOKEN;
      const high = max * tokenCost * DOLLARS_PER_TOKEN;
      setLabel(
        `If the group fills, tokens could cover on the order of $${low.toFixed(0)}–$${high.toFixed(
          0,
        )} in shared costs (about $${DOLLARS_PER_TOKEN} per paying guest slot at up to ${MAX_TOKENS} tokens—not profit).`,
      );
    }

    read();
    formEl.addEventListener("input", read);
    formEl.addEventListener("change", read);
    return () => {
      formEl.removeEventListener("input", read);
      formEl.removeEventListener("change", read);
    };
  }, [formId]);

  return (
    <div className="rounded-xl border border-gather-brown/28 bg-white/96 px-4 py-4 shadow-sm ring-1 ring-gather-teal/12 sm:px-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gather-brown-mid sm:text-[12px]">
        Estimated shared-cost budget (max {MAX_TOKENS} tokens / guest)
      </p>
      <p className="mt-2 text-[14px] leading-[1.5] italic text-gather-charcoal">
        {label}
      </p>
    </div>
  );
}
