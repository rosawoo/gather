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
  | { kind: "template"; template: CoverTemplate; bg: string | null }
  | { kind: "none" };

export function parseCover(raw: string | null | undefined): ParsedCover {
  if (!raw) return { kind: "none" };
  if (!raw.startsWith(PREFIX)) return { kind: "url", url: raw };

  const rest = raw.slice(PREFIX.length);
  const [idPart, qs = ""] = rest.split("?");
  const tpl = templateById(idPart);
  if (!tpl) return { kind: "none" };

  const params = new URLSearchParams(qs);
  const bg = params.get("bg");
  return { kind: "template", template: tpl, bg };
}

export function encodeTemplate({
  id,
  bg,
}: {
  id: CoverTemplateId;
  bg?: string | null;
}): string {
  const qs = new URLSearchParams();
  if (bg) qs.set("bg", bg);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return `${PREFIX}${id}${suffix}`;
}
