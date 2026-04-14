"use client";

import { useState, useRef, useEffect } from "react";

const DEFAULTS = [
  "East Village",
  "West Village",
  "Williamsburg",
  "Bushwick",
  "Park Slope",
  "Lower East Side",
  "Upper West Side",
  "Upper East Side",
  "Chelsea",
  "SoHo",
  "Tribeca",
  "Greenpoint",
  "Astoria",
  "DUMBO",
  "Bed-Stuy",
  "Crown Heights",
  "Harlem",
  "Midtown",
  "Nolita",
  "Prospect Heights",
  "Cobble Hill",
  "Carroll Gardens",
  "Fort Greene",
  "Clinton Hill",
  "Hell's Kitchen",
  "Murray Hill",
  "Gramercy",
  "Flatiron",
  "Financial District",
  "Brooklyn Heights",
];

export function NeighborhoodInput({
  name,
  required,
  defaultValue,
  placeholder,
  className,
  extras = [],
}: {
  name: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  /** Additional suggestions (e.g. from the database). */
  extras?: string[];
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const all = Array.from(new Set([...extras, ...DEFAULTS])).sort((a, b) =>
    a.localeCompare(b),
  );

  const filtered = value.trim()
    ? all.filter((n) => n.toLowerCase().includes(value.toLowerCase()))
    : all;

  const showList = open && filtered.length > 0;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Scroll active item into view
  useEffect(() => {
    if (activeIdx >= 0 && listRef.current) {
      const item = listRef.current.children[activeIdx] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIdx]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showList) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      setValue(filtered[activeIdx]);
      setOpen(false);
      setActiveIdx(-1);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        name={name}
        required={required}
        value={value}
        placeholder={placeholder ?? "Neighborhood"}
        autoComplete="off"
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
          setActiveIdx(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className={className}
      />
      {showList && (
        <ul
          ref={listRef}
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-neutral-200 bg-white py-1 shadow-lg"
        >
          {filtered.map((n, i) => (
            <li
              key={n}
              onMouseDown={() => {
                setValue(n);
                setOpen(false);
              }}
              className={`cursor-pointer px-4 py-2 text-sm ${
                i === activeIdx
                  ? "bg-gather-cream text-gather-brown"
                  : "text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              {n}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
