export type CoverTemplateId =
  | "cozy"
  | "dinner"
  | "outdoor"
  | "game"
  | "minimal"
  | "collage";

export type CoverTemplate = {
  id: CoverTemplateId;
  name: string;
  tagline: string;
  /** Primary/secondary bg colors for the radial-gradient composition. */
  bgPrimary: string;
  bgSecondary: string;
  /** Color for the title text when the template is used. */
  fg: string;
  accent: string;
  /** Optional decorative svg rendered on top (visual only). */
  motif: "cup" | "plate" | "leaves" | "dice" | "line" | "blocks";
};

export const COVER_TEMPLATES: CoverTemplate[] = [
  {
    id: "cozy",
    name: "Cozy coffee",
    tagline: "Warm + mellow",
    bgPrimary: "#f4ebe4",
    bgSecondary: "#d6b88f",
    fg: "#3d2f26",
    accent: "#c4a574",
    motif: "cup",
  },
  {
    id: "dinner",
    name: "Dinner table",
    tagline: "Candlelight",
    bgPrimary: "#3d2f26",
    bgSecondary: "#5c4336",
    fg: "#f4ebe4",
    accent: "#c4a574",
    motif: "plate",
  },
  {
    id: "outdoor",
    name: "Outdoor walk",
    tagline: "Fresh air",
    bgPrimary: "#c9d6bd",
    bgSecondary: "#6a7b5e",
    fg: "#1a2418",
    accent: "#f4ebe4",
    motif: "leaves",
  },
  {
    id: "game",
    name: "Game night",
    tagline: "Playful",
    bgPrimary: "#2d2345",
    bgSecondary: "#f4a261",
    fg: "#fef5ea",
    accent: "#ffd166",
    motif: "dice",
  },
  {
    id: "minimal",
    name: "Minimal tic",
    tagline: "Clean lines",
    bgPrimary: "#faf6f2",
    bgSecondary: "#e2d4c6",
    fg: "#1a1410",
    accent: "#3d2f26",
    motif: "line",
  },
  {
    id: "collage",
    name: "Colorful collage",
    tagline: "Bright + bold",
    bgPrimary: "#f28482",
    bgSecondary: "#84a59d",
    fg: "#fffaf1",
    accent: "#f5cac3",
    motif: "blocks",
  },
];

export function templateById(id: string): CoverTemplate | null {
  return COVER_TEMPLATES.find((t) => t.id === id) ?? null;
}

/**
 * Cover is stored in the gathering.coverImageUrl string.
 * - If it starts with "gathertpl:" → template composition
 * - Else → image URL
 */
const PREFIX = "gathertpl:";

export type ParsedCover =
  | { kind: "url"; url: string }
  | {
      kind: "template";
      template: CoverTemplate;
      bg: string | null;
      stickers: string[];
      overlayUrls: string[];
    }
  | { kind: "none" };

/** Preset sticker ids for template covers (comma-separated in stored URL). */
/** Dingbat-style marks + simple shapes (no emoji) so stickers stay on-brand. */
export const COVER_STICKER_PRESETS = [
  { id: "heart", glyph: "\u2665" },
  { id: "star", glyph: "\u2605" },
  { id: "sparkle", glyph: "\u2726" },
  { id: "music", glyph: "\u266A" },
  { id: "flower", glyph: "\u273F" },
  { id: "sun", glyph: "\u263C" },
  { id: "moon", glyph: "\u263D" },
  { id: "party", glyph: "\u2736" },
  { id: "coffee", glyph: "\u2299" },
  { id: "pizza", glyph: "\u25C6" },
  { id: "leaf", glyph: "\u2731" },
  { id: "book", glyph: "\u2630" },
  { id: "flag", glyph: "\u2691" },
  { id: "compass", glyph: "\u2733" },
  { id: "wave", glyph: "\u223C" },
  { id: "check", glyph: "\u2713" },
  { id: "smile_arc", glyph: "\u2311" },
  { id: "hourglass", glyph: "\u29D7" },
] as const;

export function stickerGlyph(id: string): string {
  const row = COVER_STICKER_PRESETS.find((s) => s.id === id);
  return row?.glyph ?? "";
}

function parseCoverOverlayUrlParam(raw: string | null): string | null {
  if (!raw?.trim()) return null;
  try {
    const u = decodeURIComponent(raw.trim());
    if (!/^https?:\/\//i.test(u)) return null;
    if (u.length > 2048) return null;
    return u;
  } catch {
    return null;
  }
}

export function parseCover(raw: string | null | undefined): ParsedCover {
  if (!raw) return { kind: "none" };
  if (!raw.startsWith(PREFIX)) return { kind: "url", url: raw };

  const rest = raw.slice(PREFIX.length);
  const [idPart, qs = ""] = rest.split("?");
  const tpl = templateById(idPart);
  if (!tpl) return { kind: "none" };

  const params = new URLSearchParams(qs);
  const bg = params.get("bg");
  const stickersRaw = params.get("stickers");
  const stickers = stickersRaw
    ? stickersRaw
        .split(",")
        .map((s) => decodeURIComponent(s.trim()))
        .filter(Boolean)
        .slice(0, 4)
    : [];
  const overlayUrls = (["ov0", "ov1", "ov2"] as const)
    .map((k) => parseCoverOverlayUrlParam(params.get(k)))
    .filter((u): u is string => Boolean(u));
  return { kind: "template", template: tpl, bg, stickers, overlayUrls };
}

export function encodeTemplate({
  id,
  bg,
  stickers,
  overlays,
}: {
  id: CoverTemplateId;
  bg?: string | null;
  stickers?: string[];
  /** Up to 3 small image/GIF URLs layered on the template. */
  overlays?: string[];
}): string {
  const qs = new URLSearchParams();
  if (bg) qs.set("bg", bg);
  if (stickers?.length)
    qs.set("stickers", stickers.slice(0, 4).join(","));
  if (overlays?.length) {
    overlays
      .map((u) => u.trim())
      .filter((u) => /^https?:\/\//i.test(u) && u.length <= 2048)
      .slice(0, 3)
      .forEach((u, i) => {
        qs.set(`ov${i}`, encodeURIComponent(u));
      });
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return `${PREFIX}${id}${suffix}`;
}
