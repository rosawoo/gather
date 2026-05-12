"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteNotification } from "@/app/actions/notification";

export type NotificationRow = {
  id: string;
  title: string;
  body: string;
  wasUnread: boolean;
  createdAt: string;
};

export function NotificationsFeed({ items }: { items: NotificationRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function onDelete(id: string) {
    setErr(null);
    startTransition(async () => {
      try {
        await deleteNotification(id);
        router.refresh();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Could not delete");
      }
    });
  }

  return (
    <div>
      {err ? (
        <p
          className="mb-4 rounded-xl bg-red-950/30 px-4 py-3 text-[15px] text-lc-caption-warm ring-1 ring-red-500/35"
          role="alert"
        >
          {err}
        </p>
      ) : null}

      <ul className="space-y-4">
        {items.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-lc-muted-tan/45 bg-lc-chip-surface px-6 py-10 text-center text-[15px] leading-relaxed text-lc-earth-muted backdrop-blur-sm">
            You&apos;re all caught up.
          </li>
        ) : (
          items.map((n) => (
            <li
              key={n.id}
              className={`rounded-2xl border p-5 shadow-[0_14px_40px_-28px_rgb(8_7_14_/_0.45)] backdrop-blur-[1px] transition ${
                n.wasUnread
                  ? "border-lc-tan-accent/35 bg-[rgb(36_26_26_/_0.35)] ring-1 ring-lc-tan-accent/18"
                  : "border-white/12 bg-[rgb(34_29_34_/_0.22)] ring-1 ring-white/[0.05]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {n.wasUnread ? (
                    <span className="mb-2 inline-flex items-center rounded-full bg-lc-warm-shadow px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-lc-cream shadow-sm ring-1 ring-white/10">
                      New
                    </span>
                  ) : null}
                  <p className="text-[17px] font-semibold leading-snug text-lc-cream">
                    {n.title}
                  </p>
                  <p className="mt-3 text-[15px] leading-[1.55] text-lc-caption-warm/92">
                    {n.body}
                  </p>
                  <p className="mt-3 font-sans text-[13px] text-lc-tab-muted tabular-nums">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => onDelete(n.id)}
                  className="shrink-0 rounded-full border border-white/14 bg-[rgb(52_42_52_/_0.35)] px-3 py-2 font-sans text-[13px] font-semibold text-lc-cream transition hover:border-lc-tan-accent/55 hover:bg-lc-warm-shadow/40 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
