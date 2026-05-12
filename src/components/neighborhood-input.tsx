"use client";

import { useState, useRef, useEffect, useMemo } from "react";

/** Curated fallback: a few neighborhoods and many cities. Used when offline
 *  or before the user types, and to seed the first characters. */
const WASHINGTON_DC_NEIGHBORHOODS = [
  "Adams Morgan, Washington, DC",
  "American University Park, Washington, DC",
  "Anacostia, Washington, DC",
  "Bloomingdale, Washington, DC",
  "Brightwood, Washington, DC",
  "Brookland, Washington, DC",
  "Burleith, Washington, DC",
  "Capitol Hill, Washington, DC",
  "Cathedral Heights, Washington, DC",
  "Chevy Chase, Washington, DC",
  "Chinatown, Washington, DC",
  "Cleveland Park, Washington, DC",
  "Columbia Heights, Washington, DC",
  "Congress Heights, Washington, DC",
  "Deanwood, Washington, DC",
  "Downtown, Washington, DC",
  "Dupont Circle, Washington, DC",
  "Eckington, Washington, DC",
  "Edgewood, Washington, DC",
  "Foggy Bottom, Washington, DC",
  "Fort Totten, Washington, DC",
  "Foxhall, Washington, DC",
  "Friendship Heights, Washington, DC",
  "Georgetown, Washington, DC",
  "Glover Park, Washington, DC",
  "H Street Corridor, Washington, DC",
  "Kalorama Triangle, Washington, DC",
  "Lanier Heights, Washington, DC",
  "LeDroit Park, Washington, DC",
  "Logan Circle, Washington, DC",
  "Meridian Hill, Washington, DC",
  "Mount Pleasant, Washington, DC",
  "Mount Vernon Square, Washington, DC",
  "Navy Yard, Washington, DC",
  "NoMa, Washington, DC",
  "Palisades, Washington, DC",
  "Park View, Washington, DC",
  "Penn Quarter, Washington, DC",
  "Petworth, Washington, DC",
  "Pleasant Plains, Washington, DC",
  "Shaw, Washington, DC",
  "Sheridan-Kalorama, Washington, DC",
  "Southwest Waterfront / The Wharf, Washington, DC",
  "Spring Valley, Washington, DC",
  "Takoma, Washington, DC",
  "Tenleytown, Washington, DC",
  "Trinidad, Washington, DC",
  "U Street Corridor, Washington, DC",
  "West End, Washington, DC",
  "Woodley Park, Washington, DC",
];

const DEFAULTS = [
  ...WASHINGTON_DC_NEIGHBORHOODS,
  // NYC neighborhoods
  "East Village, Manhattan",
  "West Village, Manhattan",
  "SoHo, Manhattan",
  "Tribeca, Manhattan",
  "Upper West Side, Manhattan",
  "Upper East Side, Manhattan",
  "Harlem, Manhattan",
  "Williamsburg, Brooklyn",
  "Bushwick, Brooklyn",
  "Park Slope, Brooklyn",
  "Bed-Stuy, Brooklyn",
  "Greenpoint, Brooklyn",
  "Astoria, Queens",
  // US cities
  "Boston, MA",
  "Cambridge, MA",
  "New York, NY",
  "Brooklyn, NY",
  "San Francisco, CA",
  "Oakland, CA",
  "Berkeley, CA",
  "Los Angeles, CA",
  "Santa Monica, CA",
  "San Diego, CA",
  "Chicago, IL",
  "Austin, TX",
  "Dallas, TX",
  "Houston, TX",
  "Seattle, WA",
  "Portland, OR",
  "Denver, CO",
  "Washington, DC",
  "Philadelphia, PA",
  "Miami, FL",
  "Atlanta, GA",
  "Nashville, TN",
  "Minneapolis, MN",
  "Detroit, MI",
  "Baltimore, MD",
  "Bethesda, MD",
  "Silver Spring, MD",
  "Arlington, VA",
  "Alexandria, VA",
  "Richmond, VA",
  "Charlotte, NC",
  "Raleigh, NC",
  "Durham, NC",
  "Columbus, OH",
  "Cincinnati, OH",
  "Indianapolis, IN",
  "Kansas City, MO",
  "St. Louis, MO",
  "Milwaukee, WI",
  "Sacramento, CA",
  "San Jose, CA",
  "Pittsburgh, PA",
  "New Orleans, LA",
  "Phoenix, AZ",
  "Las Vegas, NV",
  "Salt Lake City, UT",
  // International
  "Toronto, ON",
  "Vancouver, BC",
  "Montreal, QC",
  "London, UK",
  "Paris, FR",
  "Berlin, DE",
  "Amsterdam, NL",
  "Lisbon, PT",
  "Madrid, ES",
  "Barcelona, ES",
  "Mexico City, MX",
  "Tokyo, JP",
  "Seoul, KR",
  "Singapore",
  "Sydney, AU",
];

type NominatimAddress = {
  city?: string;
  town?: string;
  village?: string;
  suburb?: string;
  neighbourhood?: string;
  city_district?: string;
  state?: string;
  country_code?: string;
  country?: string;
};

type NominatimResult = {
  place_id: number;
  display_name: string;
  address?: NominatimAddress;
  type?: string;
  class?: string;
};

const USA = new Set(["us", "gb", "ca", "au", "nz", "ie"]);

function stateAbbr(state: string, country?: string): string {
  // Very small mapping; fine when Nominatim returns full state names for US.
  const map: Record<string, string> = {
    Alabama: "AL",
    Alaska: "AK",
    Arizona: "AZ",
    Arkansas: "AR",
    California: "CA",
    Colorado: "CO",
    Connecticut: "CT",
    Delaware: "DE",
    Florida: "FL",
    Georgia: "GA",
    Hawaii: "HI",
    Idaho: "ID",
    Illinois: "IL",
    Indiana: "IN",
    Iowa: "IA",
    Kansas: "KS",
    Kentucky: "KY",
    Louisiana: "LA",
    Maine: "ME",
    Maryland: "MD",
    Massachusetts: "MA",
    Michigan: "MI",
    Minnesota: "MN",
    Mississippi: "MS",
    Missouri: "MO",
    Montana: "MT",
    Nebraska: "NE",
    Nevada: "NV",
    "New Hampshire": "NH",
    "New Jersey": "NJ",
    "New Mexico": "NM",
    "New York": "NY",
    "North Carolina": "NC",
    "North Dakota": "ND",
    Ohio: "OH",
    Oklahoma: "OK",
    Oregon: "OR",
    Pennsylvania: "PA",
    "Rhode Island": "RI",
    "South Carolina": "SC",
    "South Dakota": "SD",
    Tennessee: "TN",
    Texas: "TX",
    Utah: "UT",
    Vermont: "VT",
    Virginia: "VA",
    Washington: "WA",
    "West Virginia": "WV",
    Wisconsin: "WI",
    Wyoming: "WY",
    "Washington, D.C.": "DC",
    "District of Columbia": "DC",
  };
  if (country === "us" || country === "US") return map[state] ?? state;
  return state;
}

function formatResult(r: NominatimResult): string | null {
  const a = r.address ?? {};
  const name =
    a.neighbourhood ??
    a.suburb ??
    a.city_district ??
    a.city ??
    a.town ??
    a.village ??
    r.display_name.split(",")[0].trim();
  if (!name) return null;

  const cc = a.country_code?.toLowerCase();
  const parts: string[] = [name];

  // For neighborhood/suburb results, include parent city
  const parentCity = a.city ?? a.town ?? a.village ?? null;
  if (parentCity && parentCity !== name) parts.push(parentCity);

  if (a.state && (cc === "us" || cc === "au" || cc === "ca")) {
    parts.push(stateAbbr(a.state, cc));
  } else if (!USA.has(cc ?? "") && a.country) {
    parts.push(a.country);
  }

  return Array.from(new Set(parts)).join(", ");
}

async function nominatimSearch(
  query: string,
  signal: AbortSignal,
): Promise<string[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "8");
  url.searchParams.set(
    "featuretype",
    "city",
  );
  const res = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const data = (await res.json()) as NominatimResult[];
  const kept = data.filter((r) => {
    const t = r.type ?? "";
    const c = r.class ?? "";
    return (
      c === "place" ||
      c === "boundary" ||
      t === "city" ||
      t === "town" ||
      t === "village" ||
      t === "suburb" ||
      t === "neighbourhood"
    );
  });
  const formatted = kept
    .map(formatResult)
    .filter((s): s is string => Boolean(s));
  return Array.from(new Set(formatted));
}

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
  /** Additional suggestions from the database (recent values). */
  extras?: string[];
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [remote, setRemote] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const localAll = useMemo(
    () =>
      Array.from(new Set([...extras, ...DEFAULTS])).sort((a, b) =>
        a.localeCompare(b),
      ),
    [extras],
  );

  const trimmed = value.trim();
  const localMatches = useMemo(() => {
    if (!trimmed) return localAll.slice(0, 12);
    const q = trimmed.toLowerCase();
    return localAll.filter((n) => n.toLowerCase().includes(q)).slice(0, 6);
  }, [trimmed, localAll]);

  const combined = useMemo(() => {
    const seen = new Set<string>();
    const out: { label: string; source: "local" | "api" }[] = [];
    for (const m of localMatches) {
      const k = m.toLowerCase();
      if (!seen.has(k)) {
        seen.add(k);
        out.push({ label: m, source: "local" });
      }
    }
    for (const r of remote) {
      const k = r.toLowerCase();
      if (!seen.has(k)) {
        seen.add(k);
        out.push({ label: r, source: "api" });
      }
    }
    return out;
  }, [localMatches, remote]);

  const showList = open && combined.length > 0;

  useEffect(() => {
    if (!trimmed || trimmed.length < 2) {
      setRemote([]);
      setLoading(false);
      setError(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    const t = setTimeout(async () => {
      try {
        const r = await nominatimSearch(trimmed, controller.signal);
        setRemote(r);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError(true);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [trimmed]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
      setActiveIdx((i) => Math.min(i + 1, combined.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      setValue(combined[activeIdx].label);
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
        placeholder={placeholder ?? "Neighborhood or city"}
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
      {loading ? (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.14em] text-gather-brown-mid/70">
          …
        </span>
      ) : null}
      {showList && (
        <ul
          ref={listRef}
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-xl border border-gather-teal/25 bg-white py-1 shadow-lg"
        >
          {combined.map((item, i) => (
            <li
              key={`${item.source}:${item.label}`}
              onMouseDown={() => {
                setValue(item.label);
                setOpen(false);
              }}
              className={`flex cursor-pointer items-center justify-between gap-2 px-4 py-2 text-sm ${
                i === activeIdx
                  ? "bg-gather-cream text-gather-brown"
                  : "text-gather-ink hover:bg-gather-teal/5"
              }`}
            >
              <span className="truncate">{item.label}</span>
              {item.source === "api" ? (
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-gather-charcoal/55">
                  OSM
                </span>
              ) : null}
            </li>
          ))}
          {error ? (
            <li className="px-4 py-1.5 text-[11px] text-gather-charcoal/80">
              Live search unavailable. Suggestions from your local list only.
            </li>
          ) : null}
        </ul>
      )}
    </div>
  );
}
