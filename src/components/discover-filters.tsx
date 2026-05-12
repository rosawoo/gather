"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type Options = {
  neighborhoods: string[];
  /** Espresso discover background — light controls on dark chrome */
  chrome?: "light" | "espresso";
};

type Filters = {
  q: string;
  neighborhood: string;
  type: string;
  size: string;
  cost: string;
  date: string;
};

const SIZES = [
  { label: "Any size", value: "" },
  { label: "Intimate (≤ 4)", value: "xs" },
  { label: "Small (5–7)", value: "sm" },
  { label: "Medium (8–12)", value: "md" },
  { label: "Large (13+)", value: "lg" },
];

const COSTS = [
  { label: "Any cost", value: "" },
  { label: "Free", value: "free" },
  { label: "1 token", value: "1" },
  { label: "2 tokens", value: "2" },
  { label: "3+ tokens", value: "3+" },
];

const DATES = [
  { label: "Anytime", value: "" },
  { label: "Today", value: "today" },
  { label: "This week", value: "week" },
  { label: "This month", value: "month" },
];

const TYPES = [
  { label: "Any type", value: "" },
  { label: "Home", value: "HOME" },
  { label: "Public", value: "PUBLIC" },
  { label: "Other", value: "OTHER" },
];

export function DiscoverFilters({
  neighborhoods,
  chrome = "light",
}: Options) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);

  const current: Filters = useMemo(
    () => ({
      q: sp.get("q") ?? "",
      neighborhood: sp.get("neighborhood") ?? "",
      type: sp.get("type") ?? "",
      size: sp.get("size") ?? "",
      cost: sp.get("cost") ?? "",
      date: sp.get("date") ?? "",
    }),
    [sp],
  );

  const [draft, setDraft] = useState<Filters>(current);

  const activeCount = Object.values(current).filter((v) => v).length;

  function setParam(key: keyof Filters, value: string) {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    start(() => {
      router.replace(`/gatherings?${next.toString()}`);
    });
  }

  function applyDraft() {
    const next = new URLSearchParams();
    (Object.entries(draft) as [keyof Filters, string][]).forEach(([k, v]) => {
      if (v) next.set(k, v);
    });
    start(() => {
      router.replace(`/gatherings?${next.toString()}`);
      setOpen(false);
    });
  }

  function clearAll() {
    setDraft({ q: "", neighborhood: "", type: "", size: "", cost: "", date: "" });
    start(() => {
      router.replace("/gatherings");
    });
  }

  const espresso = chrome === "espresso";

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="search"
            value={draft.q}
            placeholder="Search gatherings"
            onChange={(e) => setDraft((d) => ({ ...d, q: e.target.value }))}
            onBlur={() => setParam("q", draft.q)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setParam("q", draft.q);
              }
            }}
            className={`w-full rounded-full border px-4 py-2.5 pl-9 text-sm outline-none transition placeholder:text-neutral-400 focus:border-gather-accent focus:ring-2 focus:ring-gather-accent/40 ${
              espresso
                ? "border-white/20 bg-white/95 text-gather-ink"
                : "border-neutral-200 bg-white text-gather-ink"
            }`}
          />
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
              espresso ? "text-neutral-500" : "text-neutral-400"
            }`}
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2.5 text-[13px] font-semibold transition ${
            activeCount > 0
              ? espresso
                ? "border-gather-cream bg-gather-cream text-gather-espresso"
                : "border-gather-brown bg-gather-brown text-gather-cream"
              : espresso
                ? "border-white/25 bg-white/10 text-gather-cream hover:bg-white/15"
                : "border-neutral-200 bg-white text-gather-ink hover:border-gather-brown/40"
          }`}
          aria-expanded={open}
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M4 6h16" />
            <path d="M7 12h10" />
            <path d="M10 18h4" />
          </svg>
          Filters
          {activeCount > 0 ? (
            <span
              className={`ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                espresso
                  ? "bg-gather-espresso text-gather-cream"
                  : "bg-gather-cream text-gather-brown"
              }`}
            >
              {activeCount}
            </span>
          ) : null}
        </button>
      </div>

      {open ? (
        <div className="space-y-3 rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm ring-1 ring-black/[0.02]">
          <FilterBlock label="Neighborhood">
            <Select
              value={draft.neighborhood}
              onChange={(v) => setDraft((d) => ({ ...d, neighborhood: v }))}
              options={[{ label: "Anywhere", value: "" }].concat(
                neighborhoods.map((n) => ({ label: n, value: n })),
              )}
            />
          </FilterBlock>

          <div className="grid grid-cols-2 gap-3">
            <FilterBlock label="Type">
              <Select
                value={draft.type}
                onChange={(v) => setDraft((d) => ({ ...d, type: v }))}
                options={TYPES}
              />
            </FilterBlock>
            <FilterBlock label="Size">
              <Select
                value={draft.size}
                onChange={(v) => setDraft((d) => ({ ...d, size: v }))}
                options={SIZES}
              />
            </FilterBlock>
            <FilterBlock label="Token cost">
              <Select
                value={draft.cost}
                onChange={(v) => setDraft((d) => ({ ...d, cost: v }))}
                options={COSTS}
              />
            </FilterBlock>
            <FilterBlock label="Date">
              <Select
                value={draft.date}
                onChange={(v) => setDraft((d) => ({ ...d, date: v }))}
                options={DATES}
              />
            </FilterBlock>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 transition hover:text-gather-ink"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={applyDraft}
              disabled={pending}
              className="rounded-full bg-gather-brown px-5 py-2 text-[13px] font-semibold text-gather-cream shadow-sm transition hover:bg-gather-brown-mid disabled:opacity-60"
            >
              {pending ? "Applying…" : "Apply"}
            </button>
          </div>
        </div>
      ) : null}

      {activeCount > 0 && !open ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {current.neighborhood ? (
            <Chip
              espresso={espresso}
              label={current.neighborhood}
              onClear={() => setParam("neighborhood", "")}
            />
          ) : null}
          {current.type ? (
            <Chip
              espresso={espresso}
              label={TYPES.find((t) => t.value === current.type)?.label ?? current.type}
              onClear={() => setParam("type", "")}
            />
          ) : null}
          {current.size ? (
            <Chip
              espresso={espresso}
              label={SIZES.find((s) => s.value === current.size)?.label ?? current.size}
              onClear={() => setParam("size", "")}
            />
          ) : null}
          {current.cost ? (
            <Chip
              espresso={espresso}
              label={COSTS.find((c) => c.value === current.cost)?.label ?? current.cost}
              onClear={() => setParam("cost", "")}
            />
          ) : null}
          {current.date ? (
            <Chip
              espresso={espresso}
              label={DATES.find((d) => d.value === current.date)?.label ?? current.date}
              onClear={() => setParam("date", "")}
            />
          ) : null}
          <button
            type="button"
            onClick={clearAll}
            className={`text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
              espresso
                ? "text-gather-cream/50 hover:text-gather-cream"
                : "text-neutral-500 hover:text-gather-ink"
            }`}
          >
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  );
}

function FilterBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gather-brown-mid">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-gather-ink outline-none transition focus:border-gather-accent focus:ring-2 focus:ring-gather-accent/40"
    >
      {options.map((o) => (
        <option key={o.value || "_"} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Chip({
  label,
  onClear,
  espresso,
}: {
  label: string;
  onClear: () => void;
  espresso: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
        espresso
          ? "bg-white/12 text-gather-cream"
          : "bg-gather-brown/[0.08] text-gather-brown"
      }`}
    >
      {label}
      <button
        type="button"
        onClick={onClear}
        className={
          espresso
            ? "text-gather-cream/55 transition hover:text-gather-cream"
            : "text-gather-brown/60 transition hover:text-gather-brown"
        }
        aria-label={`Remove ${label}`}
      >
        ×
      </button>
    </span>
  );
}
