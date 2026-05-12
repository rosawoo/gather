"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { lcChrome } from "@/lib/lc-classes";

type ChromeMode = "light" | "espresso" | "candlelit";

type Options = {
  neighborhoods: string[];
  /** Light = paper app UI; espresso = legacy dark discover; candlelit = sign-in palette. */
  chrome?: ChromeMode;
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

  const chromeMode: ChromeMode = chrome ?? "light";
  const espresso = chromeMode === "espresso";
  const candlelit = chromeMode === "candlelit";
  const darkChrome = espresso || candlelit;

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
            className={`w-full rounded-full border px-4 py-2.5 pl-9 text-sm outline-none transition placeholder:text-gather-charcoal/55 focus:border-gather-accent focus:ring-2 focus:ring-gather-accent/40 ${
              candlelit
                ? "border-lc-pale-blue-border/40 bg-lc-aged-paper text-lc-ink-on-paper placeholder:text-lc-muted-tan focus:border-lc-dusty-blue focus:ring-lc-dusty-blue/35"
                : espresso
                  ? "border-white/20 bg-white/95 text-gather-ink"
                  : "border-gather-teal/25 bg-white text-gather-ink"
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
              candlelit
                ? "text-lc-ink-on-paper/45"
                : espresso
                  ? "text-gather-charcoal/80"
                  : "text-gather-charcoal/55"
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
              ? candlelit
                ? "border-lc-pale-blue-border bg-lc-dusty-blue text-lc-cream shadow-md shadow-black/20"
                : espresso
                  ? "border-gather-cream bg-gather-cream text-gather-espresso"
                  : "border-gather-brown bg-gather-brown text-gather-cream"
              : candlelit
                ? "border-lc-pale-blue-border/35 bg-lc-espresso/55 text-lc-cream backdrop-blur-sm transition hover:border-lc-cream/65 hover:bg-lc-warm-shadow/75"
                : espresso
                  ? "border-white/25 bg-white/10 text-gather-cream hover:bg-white/15"
                  : "border-gather-teal/25 bg-white text-gather-ink hover:border-gather-brown/40"
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
              className={`ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold leading-none ${
                candlelit
                  ? "bg-lc-aged-paper text-lc-ink-on-paper"
                  : espresso
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
        <div
          className={
            candlelit
              ? "space-y-3 rounded-2xl border border-lc-pale-blue-border/25 bg-lc-card-overlay p-4 text-lc-cream shadow-[0_18px_48px_rgba(0,0,0,0.35)] backdrop-blur-sm"
              : "space-y-3 rounded-2xl border border-gather-teal/25 bg-white p-4 shadow-sm ring-1 ring-gather-teal/10"
          }
        >
          <FilterBlock label="Neighborhood" chrome={chromeMode}>
            <Select
                chrome={chromeMode}
                value={draft.neighborhood}
              onChange={(v) => setDraft((d) => ({ ...d, neighborhood: v }))}
              options={[{ label: "Anywhere", value: "" }].concat(
                neighborhoods.map((n) => ({ label: n, value: n })),
              )}
            />
          </FilterBlock>

          <div className="grid grid-cols-2 gap-3">
            <FilterBlock label="Type" chrome={chromeMode}>
              <Select
                chrome={chromeMode}
                value={draft.type}
                onChange={(v) => setDraft((d) => ({ ...d, type: v }))}
                options={TYPES}
              />
            </FilterBlock>
            <FilterBlock label="Size" chrome={chromeMode}>
              <Select
                chrome={chromeMode}
                value={draft.size}
                onChange={(v) => setDraft((d) => ({ ...d, size: v }))}
                options={SIZES}
              />
            </FilterBlock>
            <FilterBlock label="Token cost" chrome={chromeMode}>
              <Select
                chrome={chromeMode}
                value={draft.cost}
                onChange={(v) => setDraft((d) => ({ ...d, cost: v }))}
                options={COSTS}
              />
            </FilterBlock>
            <FilterBlock label="Date" chrome={chromeMode}>
              <Select
                chrome={chromeMode}
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
              className={
                candlelit
                  ? `text-sm font-semibold ${lcChrome.mutedBody} uppercase tracking-[0.1em] transition hover:text-lc-cream`
                  : "text-sm font-semibold uppercase tracking-[0.1em] text-gather-charcoal/80 transition hover:text-gather-ink"
              }
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={applyDraft}
              disabled={pending}
              className={
                candlelit
                  ? "rounded-full bg-lc-dusty-blue px-5 py-2 text-[13px] font-semibold text-lc-cream shadow-md shadow-black/25 transition hover:bg-lc-dusty-blue-hover disabled:opacity-60"
                  : "rounded-full bg-gather-brown px-5 py-2 text-[13px] font-semibold text-gather-cream shadow-sm transition hover:bg-gather-brown-mid disabled:opacity-60"
              }
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
              darkChrome={darkChrome}
              label={current.neighborhood}
              onClear={() => setParam("neighborhood", "")}
            />
          ) : null}
          {current.type ? (
            <Chip
              darkChrome={darkChrome}
              label={TYPES.find((t) => t.value === current.type)?.label ?? current.type}
              onClear={() => setParam("type", "")}
            />
          ) : null}
          {current.size ? (
            <Chip
              darkChrome={darkChrome}
              label={SIZES.find((s) => s.value === current.size)?.label ?? current.size}
              onClear={() => setParam("size", "")}
            />
          ) : null}
          {current.cost ? (
            <Chip
              darkChrome={darkChrome}
              label={COSTS.find((c) => c.value === current.cost)?.label ?? current.cost}
              onClear={() => setParam("cost", "")}
            />
          ) : null}
          {current.date ? (
            <Chip
              darkChrome={darkChrome}
              label={DATES.find((d) => d.value === current.date)?.label ?? current.date}
              onClear={() => setParam("date", "")}
            />
          ) : null}
          <button
            type="button"
            onClick={clearAll}
            className={`text-sm font-semibold uppercase tracking-[0.1em] transition ${
              candlelit
                ? "text-lc-cream/50 hover:text-lc-cream"
                : espresso
                  ? "text-gather-cream/50 hover:text-gather-cream"
                  : "text-gather-charcoal/80 hover:text-gather-ink"
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
  chrome,
  children,
}: {
  label: string;
  chrome: ChromeMode;
  children: React.ReactNode;
}) {
  const labelClass =
    chrome === "candlelit"
      ? "text-lc-pale-blue-border/88"
      : "text-gather-brown-mid";

  return (
    <label className="block">
      <span
        className={`flex items-center gap-1.5 text-sm font-semibold uppercase tracking-[0.1em] ${labelClass}`}
      >
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
  chrome,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  chrome: ChromeMode;
}) {
  const selectClass =
    chrome === "candlelit"
      ? "w-full rounded-xl border border-lc-pale-blue-border/35 bg-lc-aged-paper px-3 py-2 text-sm text-lc-ink-on-paper outline-none transition focus:border-lc-dusty-blue focus:ring-2 focus:ring-lc-dusty-blue/35"
      : "w-full rounded-xl border border-gather-teal/25 bg-white px-3 py-2 text-sm text-gather-ink outline-none transition focus:border-gather-accent focus:ring-2 focus:ring-gather-accent/40";

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
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
  darkChrome,
}: {
  label: string;
  onClear: () => void;
  darkChrome: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium ${
        darkChrome
          ? "bg-lc-chip-surface text-lc-cream"
          : "bg-gather-brown/[0.08] text-gather-brown"
      }`}
    >
      {label}
      <button
        type="button"
        onClick={onClear}
        className={
          darkChrome
            ? "text-lc-cream/55 transition hover:text-lc-cream"
            : "text-gather-brown/60 transition hover:text-gather-brown"
        }
        aria-label={`Remove ${label}`}
      >
        ×
      </button>
    </span>
  );
}
