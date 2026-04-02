"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { requestToJoin } from "@/app/actions/request";

export function JoinRequestForm({
  gatheringId,
  tokenCost,
}: {
  gatheringId: string;
  tokenCost: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <form
      className="mt-4 space-y-3 rounded-xl border border-neutral-200 bg-white p-4"
      action={(fd) => {
        setErr(null);
        start(async () => {
          try {
            await requestToJoin(
              gatheringId,
              String(fd.get("comment") ?? ""),
            );
            router.push("/gatherings/upcoming");
          } catch (e) {
            setErr(e instanceof Error ? e.message : "Something went wrong");
          }
        });
      }}
    >
      <p className="text-sm text-neutral-700">
        This costs <strong>{tokenCost}</strong> token
        {tokenCost === 1 ? "" : "s"}. Tokens are held while the host reviews.
        If you&apos;re approved, tokens are used. If not a match, they return.
      </p>
      <div>
        <label className="text-xs font-medium text-neutral-500">
          Anything the host should know?
        </label>
        <textarea
          name="comment"
          rows={3}
          className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none ring-gather-accent focus:ring-2"
          placeholder="e.g. My friend Ava is also requesting — we’d love to come together."
        />
      </div>
      {err ? <p className="text-sm text-red-700">{err}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-gather-brown py-3 text-sm font-medium text-gather-cream disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Request to join"}
      </button>
    </form>
  );
}
