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
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
        !optedOut ? "bg-gather-brown" : "bg-gather-line/55"
      } ${pending ? "opacity-50" : ""}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200 ${
          !optedOut ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
