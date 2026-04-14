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
        className="text-sm font-medium text-red-600 hover:underline"
      >
        Delete my account
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-medium text-red-800">
        This will permanently delete your account, profile, photos, and all
        associated data. This cannot be undone.
      </p>
      <div className="mt-3 flex gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => deleteAccount())}
          className={`rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white ${
            pending ? "opacity-50" : "hover:bg-red-700"
          }`}
        >
          {pending ? "Deleting..." : "Yes, delete everything"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
