"use client";

import { useEffect, useState } from "react";
import {
  COVER_TEMPLATES,
  encodeTemplate,
  parseCover,
  type CoverTemplateId,
} from "@/lib/cover";
import { CoverArt, TemplatePreview } from "@/components/cover-art";

type Mode = "template" | "upload";

export function CoverEditor({
  name = "coverImageUrl",
  titleFieldName = "title",
  initialValue = "",
  initialTitle = "",
}: {
  name?: string;
  titleFieldName?: string;
  initialValue?: string;
  initialTitle?: string;
}) {
  const initial = parseCover(initialValue);

  const [mode, setMode] = useState<Mode>(
    initial.kind === "url" ? "upload" : "template",
  );
  const [templateId, setTemplateId] = useState<CoverTemplateId>(
    initial.kind === "template" ? initial.template.id : "cozy",
  );
  const [bg, setBg] = useState<string>(
    initial.kind === "template" && initial.bg ? initial.bg : "",
  );
  const [url, setUrl] = useState<string>(
    initial.kind === "url" ? initial.url : "",
  );
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const form = document.querySelector<HTMLFormElement>("form");
    if (!form) return;
    const titleInput = form.querySelector<HTMLInputElement>(
      `input[name="${titleFieldName}"]`,
    );
    if (!titleInput) return;
    const sync = () => setTitle(titleInput.value);
    titleInput.addEventListener("input", sync);
    const id = queueMicrotask(() => setTitle(titleInput.value));
    return () => {
      titleInput.removeEventListener("input", sync);
      void id;
    };
  }, [titleFieldName]);

  const value =
    mode === "upload"
      ? url.trim()
      : encodeTemplate({ id: templateId, bg: bg || null });

  const activeTemplate = COVER_TEMPLATES.find((t) => t.id === templateId)!;

  return (
    <div>
      <div className="flex gap-1 rounded-full border border-neutral-200 bg-neutral-50 p-1">
        <ModeTab
          active={mode === "template"}
          onClick={() => setMode("template")}
        >
          Templates
        </ModeTab>
        <ModeTab active={mode === "upload"} onClick={() => setMode("upload")}>
          Upload / URL
        </ModeTab>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <div className="aspect-[16/9] w-full bg-neutral-100">
          {mode === "template" ? (
            <TemplatePreview
              template={activeTemplate}
              bgOverride={bg || null}
              title={title}
            />
          ) : (
            <CoverArt cover={url || null} title={title} eager />
          )}
        </div>
      </div>

      {mode === "template" ? (
        <>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gather-brown-mid">
            Pick a style
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {COVER_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTemplateId(t.id);
                  setBg("");
                }}
                className={`overflow-hidden rounded-xl border text-left transition ${
                  templateId === t.id
                    ? "border-gather-brown ring-2 ring-gather-accent/40"
                    : "border-neutral-200 hover:border-gather-accent/40"
                }`}
                aria-pressed={templateId === t.id}
              >
                <div className="aspect-[16/10] w-full">
                  <TemplatePreview template={t} title={title} />
                </div>
                <div className="bg-white px-2 py-1.5">
                  <p className="text-[11px] font-semibold text-gather-ink">
                    {t.name}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gather-brown-mid">
            Background tint
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <SwatchButton
              active={!bg}
              color={activeTemplate.bgPrimary}
              onClick={() => setBg("")}
              label="Default"
            />
            {[
              "#faf6f2",
              "#f4ebe4",
              "#c4a574",
              "#3d2f26",
              "#84a59d",
              "#f28482",
              "#2d2345",
            ].map((c) => (
              <SwatchButton
                key={c}
                active={bg === c}
                color={c}
                onClick={() => setBg(c)}
                label={c}
              />
            ))}
            <label className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-2 py-1 text-xs text-gather-brown-mid">
              <input
                type="color"
                value={bg || activeTemplate.bgPrimary}
                onChange={(e) => setBg(e.target.value)}
                className="h-5 w-5 cursor-pointer rounded-full border-0 bg-transparent p-0"
                aria-label="Custom color"
              />
              Custom
            </label>
          </div>
        </>
      ) : (
        <div className="mt-4 space-y-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/cover.jpg"
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gather-ink outline-none transition placeholder:text-neutral-400 focus:border-gather-accent focus:ring-2 focus:ring-gather-accent/40"
          />
          <p className="text-xs text-neutral-500">
            Paste an image URL. Direct file upload is coming soon — for now, any
            public image URL works.
          </p>
        </div>
      )}

      <input type="hidden" name={name} value={value} />
    </div>
  );
}

function ModeTab({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-1 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
        active
          ? "bg-white text-gather-brown shadow-sm ring-1 ring-black/[0.04]"
          : "text-gather-brown-mid hover:text-gather-brown"
      }`}
    >
      {children}
    </button>
  );
}

function SwatchButton({
  color,
  active,
  label,
  onClick,
}: {
  color: string;
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`h-8 w-8 rounded-full border transition ${
        active
          ? "border-gather-brown ring-2 ring-gather-accent/40"
          : "border-neutral-200 hover:border-gather-accent/40"
      }`}
      style={{ backgroundColor: color }}
    />
  );
}
