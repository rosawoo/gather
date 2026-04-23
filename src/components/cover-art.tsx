import { parseCover, type CoverTemplate } from "@/lib/cover";

export function CoverArt({
  cover,
  title,
  className = "",
  eager = false,
}: {
  cover: string | null | undefined;
  title: string;
  className?: string;
  eager?: boolean;
}) {
  const parsed = parseCover(cover);

  if (parsed.kind === "url") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={parsed.url}
        alt=""
        loading={eager ? "eager" : "lazy"}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  if (parsed.kind === "template") {
    return (
      <TemplatePreview
        template={parsed.template}
        bgOverride={parsed.bg}
        title={title}
        className={className}
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-neutral-100 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400 ${className}`}
    >
      No cover
    </div>
  );
}

export function TemplatePreview({
  template,
  bgOverride,
  title,
  className = "",
}: {
  template: CoverTemplate;
  bgOverride?: string | null;
  title: string;
  className?: string;
}) {
  const bg = bgOverride || template.bgPrimary;
  return (
    <div
      className={`relative flex h-full w-full flex-col justify-end overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(120% 90% at 20% 10%, ${template.bgSecondary}, ${bg} 68%)`,
      }}
    >
      <Motif motif={template.motif} accent={template.accent} fg={template.fg} />

      <div className="relative p-4">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em]"
          style={{
            color: template.fg,
            backgroundColor: `${template.accent}33`,
          }}
        >
          <span
            aria-hidden
            className="h-1 w-3 rounded-full"
            style={{ backgroundColor: template.accent }}
          />
          {template.tagline}
        </span>
        <p
          className="mt-2 line-clamp-3 font-serif text-[20px] font-light leading-tight tracking-tight"
          style={{ color: template.fg }}
        >
          {title || "Your gathering"}
        </p>
      </div>
    </div>
  );
}

function Motif({
  motif,
  accent,
  fg,
}: {
  motif: CoverTemplate["motif"];
  accent: string;
  fg: string;
}) {
  const commonStroke = {
    stroke: fg,
    strokeWidth: 1.6,
    fill: "none",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const fillAccent = { fill: accent, stroke: "none" };

  return (
    <svg
      aria-hidden
      viewBox="0 0 200 150"
      className="absolute right-3 top-3 h-16 w-auto opacity-80"
    >
      {motif === "cup" && (
        <>
          <circle cx="160" cy="40" r="22" {...fillAccent} />
          <path d="M145 50c0 12 6 20 15 20s15-8 15-20" {...commonStroke} />
          <path d="M175 55c8 0 10 8 4 12" {...commonStroke} />
          <path d="M145 34c0-4 4-6 8-4" {...commonStroke} />
        </>
      )}
      {motif === "plate" && (
        <>
          <circle cx="160" cy="50" r="30" {...fillAccent} />
          <circle cx="160" cy="50" r="20" {...commonStroke} />
          <path d="M136 22v24" {...commonStroke} />
          <path d="M184 22v24" {...commonStroke} />
        </>
      )}
      {motif === "leaves" && (
        <>
          <path
            d="M150 30c10 0 22 10 22 22 0 12-10 22-22 22s-22-10-22-22c0-12 12-22 22-22Z"
            {...fillAccent}
          />
          <path d="M150 30v44M130 52h44" {...commonStroke} />
        </>
      )}
      {motif === "dice" && (
        <>
          <rect
            x="138"
            y="22"
            width="44"
            height="44"
            rx="6"
            {...fillAccent}
          />
          <circle cx="150" cy="34" r="3" fill={fg} />
          <circle cx="170" cy="54" r="3" fill={fg} />
          <circle cx="160" cy="44" r="3" fill={fg} />
        </>
      )}
      {motif === "line" && (
        <>
          <path d="M120 55h60" {...commonStroke} />
          <circle cx="120" cy="55" r="3" {...fillAccent} />
          <circle cx="180" cy="55" r="3" {...fillAccent} />
        </>
      )}
      {motif === "blocks" && (
        <>
          <rect x="130" y="18" width="22" height="22" rx="3" {...fillAccent} />
          <rect
            x="158"
            y="26"
            width="20"
            height="20"
            rx="3"
            stroke={fg}
            strokeWidth={1.6}
            fill="none"
          />
          <rect
            x="140"
            y="48"
            width="26"
            height="16"
            rx="3"
            stroke={fg}
            strokeWidth={1.6}
            fill="none"
          />
        </>
      )}
    </svg>
  );
}
