"use client";

import { upload } from "@vercel/blob/client";
import { useEffect, useRef, useState } from "react";
import {
  COVER_STICKER_PRESETS,
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
  const [stickers, setStickers] = useState<string[]>(
    initial.kind === "template" ? initial.stickers : [],
  );
  const [overlays, setOverlays] = useState<[string, string, string]>(() =>
    initial.kind === "template"
      ? [
          initial.overlayUrls[0] ?? "",
          initial.overlayUrls[1] ?? "",
          initial.overlayUrls[2] ?? "",
        ]
      : ["", "", ""],
  );
  const [url, setUrl] = useState<string>(
    initial.kind === "url" ? initial.url : "",
  );
  const [title, setTitle] = useState(initialTitle);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const ov0Ref = useRef<HTMLInputElement>(null);
  const ov1Ref = useRef<HTMLInputElement>(null);
  const ov2Ref = useRef<HTMLInputElement>(null);
  const ovRefs = [ov0Ref, ov1Ref, ov2Ref] as const;

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
      : encodeTemplate({
          id: templateId,
          bg: bg || null,
          stickers,
          overlays: overlays.map((o) => o.trim()).filter(Boolean),
        });

  const activeTemplate = COVER_TEMPLATES.find((t) => t.id === templateId)!;

  async function onCoverFile(file: File | null) {
    if (!file) return;
    setUploadErr(null);
    if (!/^image\/(jpeg|png|webp|gif|heic)$/i.test(file.type)) {
      setUploadErr("Use a JPG, PNG, WebP, GIF, or HEIC file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadErr("Max file size is 8 MB.");
      return;
    }
    setUploading(true);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/blob-upload",
      });
      setUrl(blob.url);
      setMode("upload");
    } catch (e) {
      setUploadErr(
        e instanceof Error
          ? e.message
          : "Upload failed — paste a public image or GIF URL instead.",
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onOverlayFile(slot: 0 | 1 | 2, file: File | null) {
    if (!file) return;
    setUploadErr(null);
    if (!/^image\/(jpeg|png|webp|gif|heic)$/i.test(file.type)) {
      setUploadErr("Overlays: use a JPG, PNG, WebP, GIF, or HEIC file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadErr("Each overlay must be under 8 MB.");
      return;
    }
    setUploading(true);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/blob-upload",
      });
      setOverlays((prev) => {
        const next: [string, string, string] = [...prev];
        next[slot] = blob.url;
        return next;
      });
    } catch (e) {
      setUploadErr(
        e instanceof Error ? e.message : "Overlay upload failed.",
      );
    } finally {
      setUploading(false);
      const r = ovRefs[slot].current;
      if (r) r.value = "";
    }
  }

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
              stickers={stickers}
              overlayUrls={overlays.map((o) => o.trim()).filter(Boolean)}
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
                  <TemplatePreview template={t} title={title} stickers={[]} />
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

          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gather-brown-mid">
            Stickers (optional, max 4)
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Tap to add tiny accents on the polaroid template — great with GIFs in
            upload mode too.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {COVER_STICKER_PRESETS.map((s) => {
              const on = stickers.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setStickers((prev) => {
                      if (prev.includes(s.id))
                        return prev.filter((x) => x !== s.id);
                      if (prev.length >= 4) return prev;
                      return [...prev, s.id];
                    });
                  }}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition ${
                    on
                      ? "border-gather-brown bg-gather-cream/80 ring-2 ring-gather-accent/40"
                      : "border-neutral-200 bg-white hover:border-gather-accent/40"
                  }`}
                  aria-pressed={on}
                  title={s.id}
                >
                  {s.glyph}
                </button>
              );
            })}
          </div>

          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gather-brown-mid">
            Image or GIF overlays (optional, max 3)
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Layer small graphics on the template — logos, memes, or transparent
            PNGs. Paste a URL or upload.
          </p>
          {([0, 1, 2] as const).map((slot) => (
            <div key={slot} className="mt-2 flex flex-wrap items-center gap-2">
              <input
                type="url"
                value={overlays[slot]}
                onChange={(e) =>
                  setOverlays((prev) => {
                    const next: [string, string, string] = [...prev];
                    next[slot] = e.target.value;
                    return next;
                  })
                }
                placeholder={`Image URL ${slot + 1}`}
                className="min-w-[12rem] flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-gather-ink outline-none transition placeholder:text-neutral-400 focus:border-gather-accent focus:ring-2 focus:ring-gather-accent/40"
              />
              <input
                ref={ovRefs[slot]}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/heic"
                className="hidden"
                onChange={(e) =>
                  void onOverlayFile(slot, e.target.files?.[0] ?? null)
                }
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => ovRefs[slot].current?.click()}
                className="shrink-0 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-gather-brown transition hover:border-gather-brown disabled:opacity-50"
              >
                Upload
              </button>
              {overlays[slot] ? (
                <button
                  type="button"
                  onClick={() =>
                    setOverlays((prev) => {
                      const next: [string, string, string] = [...prev];
                      next[slot] = "";
                      return next;
                    })
                  }
                  className="text-xs font-medium text-neutral-500 hover:text-red-600"
                >
                  Clear
                </button>
              ) : null}
            </div>
          ))}
        </>
      ) : (
        <div className="mt-4 space-y-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/heic"
            className="hidden"
            onChange={(e) => void onCoverFile(e.target.files?.[0] ?? null)}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="rounded-full border border-gather-brown px-4 py-2 text-sm font-semibold text-gather-brown transition hover:bg-gather-brown hover:text-gather-cream disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload image or GIF"}
            </button>
          </div>
          {uploadErr ? (
            <p className="text-xs text-red-600">{uploadErr}</p>
          ) : null}
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Or paste URL (image or GIF)"
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gather-ink outline-none transition placeholder:text-neutral-400 focus:border-gather-accent focus:ring-2 focus:ring-gather-accent/40"
          />
          <p className="text-xs text-neutral-500">
            Animated GIFs work as cover art. With Blob storage connected, uploads
            go straight to your gallery URL.
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
