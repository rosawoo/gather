"use client";

import { useTransition } from "react";
import { toggleSmsOptOut } from "@/app/actions/account";

export function SmsToggle({ optedOut }: { optedOut: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => toggleSmsOptOut())}
      className={`flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-lc-control-brown/38 px-[3px] transition-colors duration-200 ${
        !optedOut
          ? "justify-end bg-gather-accent shadow-[inset_0_1px_0_rgb(255_255_255_/_0.06)]"
          : "justify-start bg-lc-settings-helper/45"
      } ${pending ? "opacity-50" : ""}`}
    >
      <span className="pointer-events-none inline-block h-5 w-5 shrink-0 rounded-full bg-lc-settings-parchment shadow-sm ring-1 ring-black/[0.08]" />
    </button>
  );
}
