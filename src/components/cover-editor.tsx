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

/** `hostForm`: calmer typography, fewer templates upfront, stickers/overlays tucked in details */
export type CoverEditorDensity = "default" | "hostForm";

export function CoverEditor({
  name = "coverImageUrl",
  titleFieldName = "title",
  initialValue = "",
  initialTitle = "",
  density = "default",
}: {
  name?: string;
  titleFieldName?: string;
  initialValue?: string;
  initialTitle?: string;
  density?: CoverEditorDensity;
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
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [showAllStickers, setShowAllStickers] = useState(false);
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

  const isHostForm = density === "hostForm";
  const INITIAL_TEMPLATES = 4;
  const INITIAL_STICKERS = 8;
  const templateList =
    isHostForm && !showAllTemplates
      ? COVER_TEMPLATES.slice(0, INITIAL_TEMPLATES)
      : COVER_TEMPLATES;

  const stickerList =
    isHostForm && !showAllStickers
      ? COVER_STICKER_PRESETS.slice(0, INITIAL_STICKERS)
      : [...COVER_STICKER_PRESETS];

  const sectionLabelCls = isHostForm
    ? "mt-6 text-[13px] font-semibold uppercase tracking-[0.08em] text-lc-settings-label sm:mt-7 sm:text-[14px]"
    : "mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gather-brown-mid";

  const helpCls = isHostForm
    ? "mt-1.5 text-[13px] leading-[1.45] text-lc-settings-helper"
    : "mt-3 text-xs leading-relaxed text-gather-charcoal/80";

  const tmplNameCls = isHostForm
    ? "text-[12px] font-semibold text-lc-settings-ink-strong sm:text-[13px]"
    : "text-[11px] font-semibold text-gather-ink";

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
          : "Upload failed. Paste a public image or GIF URL instead.",
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
      <div className="flex gap-1 rounded-full border border-gather-teal/25 bg-gather-cream/60 p-1">
        <ModeTab
          active={mode === "template"}
          density={density}
          onClick={() => setMode("template")}
        >
          Templates
        </ModeTab>
        <ModeTab density={density} active={mode === "upload"} onClick={() => setMode("upload")}>
          Upload / URL
        </ModeTab>
      </div>
      <p className={helpCls}>
        {isHostForm
          ? "Templates read like Polaroids on the wall (GIFs sparkle). Grainy uploads can work, but you’ll usually get a sharper card by starting from a template, tint, stickers, then optional overlays."
          : "Templates with stickers and small image overlays usually read clearer on the discover wall than a single dark phone photo—mix and match until it feels like a polaroid on a table."}
      </p>

      <div className="mt-4 overflow-hidden rounded-2xl border border-gather-teal/25 bg-white shadow-sm ring-1 ring-gather-teal/10">
        {/* Polaroid-sized preview — cap height so the rest of the form stays visible */}
        <div className="cover-preview relative mx-auto aspect-[4/3] max-h-[280px] min-h-[200px] w-full max-w-[min(100%,22rem)] overflow-hidden bg-gather-line/40 sm:min-h-[220px]">
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
          <p
            className={
              isHostForm
                ? "mt-4 font-semibold uppercase tracking-[0.08em] text-lc-settings-label sm:mt-5 sm:text-[14px]"
                : sectionLabelCls
            }
          >
            Pick a style
          </p>
          <div
            className={
              isHostForm
                ? "mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3"
                : "mt-2 grid grid-cols-3 gap-2"
            }
          >
            {templateList.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTemplateId(t.id);
                  setBg("");
                }}
                className={`overflow-hidden rounded-xl border text-left transition focus-visible:outline focus-visible:ring-2 focus-visible:ring-gather-accent ${
                  templateId === t.id
                    ? isHostForm
                      ? "border-gather-brown shadow-[0_0_0_2px_rgb(228_219_207)] ring-2 ring-gather-brown/90"
                      : "border-gather-brown ring-2 ring-gather-accent/40"
                    : "border-gather-teal/25 hover:border-gather-accent/40"
                }`}
                aria-pressed={templateId === t.id}
              >
                <div className="aspect-[16/10] w-full">
                  <TemplatePreview template={t} title={title} stickers={[]} />
                </div>
                <div className="bg-white px-2 py-1.5 sm:px-2.5 sm:py-2">
                  <p className={tmplNameCls}>{t.name}</p>
                </div>
              </button>
            ))}
          </div>
          {isHostForm &&
          !showAllTemplates &&
          COVER_TEMPLATES.length > INITIAL_TEMPLATES ? (
            <button
              type="button"
              className="mt-3 font-serif text-[14px] font-semibold lowercase text-gather-accent underline-offset-4 hover:underline"
              onClick={() => setShowAllTemplates(true)}
            >
              View all templates
            </button>
          ) : null}

          <p className={sectionLabelCls}>Background tint</p>
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <SwatchButton
              active={!bg}
              density={density}
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
                density={density}
                color={c}
                onClick={() => setBg(c)}
                label={c}
              />
            ))}
            <label
              className={
                isHostForm
                  ? "inline-flex items-center gap-2 rounded-full border border-gather-teal/25 px-2.5 py-1 text-[13px] text-lc-settings-label"
                  : "inline-flex items-center gap-2 rounded-full border border-gather-teal/25 px-2 py-1 text-xs text-gather-brown-mid"
              }
            >
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

          {isHostForm ? (
            <details className="group mt-6 rounded-xl border border-gather-teal/26 bg-white/75 p-4 ring-1 ring-black/[0.03] shadow-sm">
              <summary className="cursor-pointer list-none font-semibold text-lc-settings-ink-strong [&::-webkit-details-marker]:hidden sm:text-[15px]">
                Add stickers &amp; overlays{" "}
                <span className="font-normal text-lc-settings-helper">(optional)</span>
              </summary>
              <div className="mt-4 border-t border-gather-teal/16 pt-4">
                <p className="text-[13px] leading-[1.45] text-lc-settings-helper">
                  Small marks or layered GIFs—you can skip this for a simpler polaroid. Up to 4 sticker
                  marks and 3 images.
                </p>
                <p className={sectionLabelCls}>Stickers</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {stickerList.map((s) => {
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
                        className={`flex h-11 w-11 items-center justify-center rounded-xl border text-[1.2rem] leading-none transition hover:border-gather-accent/50 ${
                          on
                            ? "border-gather-brown bg-gather-paper ring-2 ring-gather-accent/60"
                            : "border-gather-teal/28 bg-white"
                        }`}
                        aria-pressed={on}
                        title={s.id}
                      >
                        {s.glyph}
                      </button>
                    );
                  })}
                </div>
                {!showAllStickers && COVER_STICKER_PRESETS.length > INITIAL_STICKERS ? (
                  <button
                    type="button"
                    className="mt-3 font-serif text-[13px] font-semibold lowercase text-gather-accent underline-offset-4 hover:underline"
                    onClick={() => setShowAllStickers(true)}
                  >
                    Show more sticker marks
                  </button>
                ) : null}

                <p className={sectionLabelCls}>Image or GIF overlays (max 3)</p>
                {([0, 1, 2] as const).map((slot) => (
                  <div key={slot} className="mt-3 flex flex-wrap items-center gap-2">
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
                      placeholder={`Paste image URL (${slot + 1})`}
                      className="min-w-[11rem] flex-1 rounded-xl border border-gather-teal/25 bg-white px-3 py-2.5 text-[15px] text-gather-ink outline-none transition placeholder:text-[#6f625a] focus:border-gather-accent focus:ring-2 focus:ring-gather-accent/38"
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
                      className="shrink-0 rounded-full border border-gather-teal/38 bg-white px-3 py-2 text-[13px] font-semibold text-gather-brown transition hover:border-gather-brown disabled:opacity-50"
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
                        className="text-[13px] font-medium text-lc-settings-helper hover:text-red-600"
                      >
                        Clear
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </details>
          ) : (
            <>
              <p className={sectionLabelCls}>Stickers (optional, max 4)</p>
              <p className="text-xs leading-relaxed text-gather-charcoal/80">
                Stickers use simple marks; overlays accept transparent PNG/GIF URLs or uploads layered on
                top. Combine up to four stickers with three overlays.
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
                          : "border-gather-teal/25 bg-white hover:border-gather-accent/40"
                      }`}
                      aria-pressed={on}
                      title={s.id}
                    >
                      {s.glyph}
                    </button>
                  );
                })}
              </div>

              <p className={sectionLabelCls}>Image or GIF overlays (optional, max 3)</p>
              <p className="mt-1 text-xs text-gather-charcoal/80">
                Layer small graphics on the template: logos, memes, or transparent PNGs. Paste a URL or
                upload.
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
                    className="min-w-[12rem] flex-1 rounded-xl border border-gather-teal/25 bg-white px-3 py-2 text-sm text-gather-ink outline-none transition placeholder:text-gather-charcoal/55 focus:border-gather-accent focus:ring-2 focus:ring-gather-accent/40"
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
                    className="shrink-0 rounded-full border border-gather-teal/35 bg-white px-3 py-1.5 text-xs font-semibold text-gather-brown transition hover:border-gather-brown disabled:opacity-50"
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
                      className="text-xs font-medium text-gather-charcoal/80 hover:text-red-600"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>
              ))}
            </>
          )}
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
              className={
                isHostForm
                  ? "rounded-full border border-gather-brown px-4 py-2.5 text-[15px] font-semibold text-gather-brown transition hover:bg-gather-brown hover:text-gather-cream disabled:opacity-50"
                  : "rounded-full border border-gather-brown px-4 py-2 text-sm font-semibold text-gather-brown transition hover:bg-gather-brown hover:text-gather-cream disabled:opacity-50"
              }
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
            className={
              "w-full rounded-xl border border-gather-teal/25 bg-white px-4 outline-none transition focus:border-gather-accent focus:ring-2 focus:ring-gather-accent/40 " +
              (isHostForm
                ? "py-3.5 text-[15px] text-gather-ink placeholder:text-[#6f625a]"
                : "py-3 text-sm text-gather-ink placeholder:text-gather-charcoal/55")
            }
          />
          <p className={isHostForm ? helpCls : "text-xs leading-relaxed text-gather-charcoal/80"}>
            Use a GIF or crisp image (~900px wide or larger reads best on cards).
            Uploads use your Blob connection when configured.
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
  density = "default",
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  density?: CoverEditorDensity;
}) {
  const host = density === "hostForm";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-1 rounded-full px-3 transition ${
        host
          ? "py-2 text-[12px] font-semibold uppercase tracking-[0.1em] sm:text-[13px]"
          : "py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]"
      } ${
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
  density = "default",
}: {
  color: string;
  active: boolean;
  label: string;
  onClick: () => void;
  density?: CoverEditorDensity;
}) {
  const host = density === "hostForm";
  const size = host ? "h-9 w-9" : "h-8 w-8";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`${size} rounded-full border transition ${
        active
          ? "border-gather-brown ring-2 ring-gather-accent/45"
          : "border-gather-teal/25 hover:border-gather-accent/40"
      }`}
      style={{ backgroundColor: color }}
    />
  );
}
