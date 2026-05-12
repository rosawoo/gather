"use client";

import { useState, useTransition } from "react";
import { deleteAccount } from "@/app/actions/account";

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-[15px] font-semibold text-red-800 underline-offset-4 hover:underline"
      >
        Delete my account
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-red-900/25 bg-[rgb(250_239_239_/_0.95)] p-4 ring-1 ring-red-900/[0.06] backdrop-blur-[1px]">
      <p className="font-sans text-[14px] font-medium leading-relaxed text-red-950">
        This will permanently delete your account, profile, photos, and all
        associated data. This cannot be undone.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => deleteAccount())}
          className={`rounded-full bg-red-800 px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-red-950 ${
            pending ? "opacity-50" : ""
          }`}
        >
          {pending ? "Deleting..." : "Yes, delete everything"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-full border border-lc-control-brown/38 bg-lc-settings-parchment/90 px-5 py-2.5 text-[14px] font-semibold text-lc-settings-ink-strong shadow-[inset_0_1px_0_rgb(255_255_255_/_0.35)] hover:border-lc-control-brown/50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
