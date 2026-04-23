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
      className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm ring-1 ring-black/[0.02]"
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
      <p className="text-sm leading-relaxed text-neutral-700">
        This costs{" "}
        <strong className="text-gather-brown">
          {tokenCost} token{tokenCost === 1 ? "" : "s"}
        </strong>
        . Tokens are held while the host reviews. If approved, tokens are
        used — if not a match, they return.
      </p>
      <div>
        <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gather-brown-mid">
          Anything the host should know?
        </label>
        <textarea
          name="comment"
          rows={3}
          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-gather-ink outline-none transition placeholder:text-neutral-400 focus:border-gather-accent focus:ring-2 focus:ring-gather-accent/40"
          placeholder="e.g. My friend Ava is also requesting — we’d love to come together."
        />
      </div>
      {err ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {err}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-gather-brown py-3 text-sm font-semibold text-gather-cream shadow-sm transition hover:bg-gather-brown-mid active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Request to join"}
      </button>
    </form>
  );
}
