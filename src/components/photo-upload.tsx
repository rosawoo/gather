"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState, useLayoutEffect } from "react";

type Photo = { id: string; url: string };

const ALLOWED = /^image\/(jpeg|png|webp|gif|heic)$/i;
const MAX_BYTES = 8 * 1024 * 1024;
const INLINE_FALLBACK_MAX_BYTES = 2 * 1024 * 1024;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function PhotoUpload({
  name = "photoUrls",
  initialUrls = [],
}: {
  name?: string;
  initialUrls?: string[];
}) {
  const [photos, setPhotos] = useState<Photo[]>(
    initialUrls.map((url, i) => ({ id: `seed-${i}`, url })),
  );
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const [dragging, setDragging] = useState(false);
  const [pasted, setPasted] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [inlineMode, setInlineMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);

  const value = photos.map((p) => p.url).join("\n");

  useLayoutEffect(() => {
    if (hiddenRef.current) hiddenRef.current.value = value;
  }, [value]);

  function newId() {
    return typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  }

  async function inlineFallback(files: File[]): Promise<Photo[]> {
    const accepted: Photo[] = [];
    for (const file of files) {
      if (file.size > INLINE_FALLBACK_MAX_BYTES) {
        throw new Error(
          "In local preview each image must be under 2 MB. Connect Vercel Blob for larger uploads.",
        );
      }
      const dataUrl = await readAsDataUrl(file);
      accepted.push({ id: newId(), url: dataUrl });
    }
    return accepted;
  }

  async function uploadFiles(files: File[]) {
    setError(null);
    setNotice(null);
    const valid = files.filter((f) => {
      if (!ALLOWED.test(f.type)) {
        setError("Only image files please.");
        return false;
      }
      if (f.size > MAX_BYTES) {
        setError("Each image must be under 8 MB.");
        return false;
      }
      return true;
    });
    if (valid.length === 0) return;

    setUploading(true);
    setProgress({ done: 0, total: valid.length });

    if (inlineMode) {
      try {
        const accepted = await inlineFallback(valid);
        setPhotos((p) => [...p, ...accepted]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't read image.");
      } finally {
        setUploading(false);
        setProgress(null);
      }
      return;
    }

    const accepted: Photo[] = [];
    try {
      for (const file of valid) {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/blob-upload",
        });
        accepted.push({ id: newId(), url: blob.url });
        setProgress((p) => (p ? { ...p, done: p.done + 1 } : null));
      }
      setPhotos((p) => [...p, ...accepted]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed.";
      const blobUnavailable =
        /unauthorized|token|BLOB|501|not configured/i.test(msg);
      if (blobUnavailable) {
        try {
          const fallback = await inlineFallback(valid);
          setPhotos((p) => [...p, ...fallback]);
          setInlineMode(true);
          setNotice(
            "Blob storage isn't configured, so photos are stored inline for now. Fine for local previewing; connect Vercel Blob before going live.",
          );
        } catch (fe) {
          setError(fe instanceof Error ? fe.message : "Couldn't read image.");
        }
      } else {
        setError(msg);
      }
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) void uploadFiles(files);
  }

  function addFromUrl() {
    const u = pasted.trim();
    if (!u) return;
    if (!/^https?:\/\//i.test(u)) {
      setError("URL must start with http:// or https://");
      return;
    }
    setError(null);
    setPhotos((p) => [
      ...p,
      { id: `url-${Date.now()}-${Math.random()}`, url: u },
    ]);
    setPasted("");
  }

  function remove(id: string) {
    setPhotos((p) => p.filter((x) => x.id !== id));
  }

  function move(id: string, dir: -1 | 1) {
    setPhotos((p) => {
      const i = p.findIndex((x) => x.id === id);
      if (i < 0) return p;
      const j = i + dir;
      if (j < 0 || j >= p.length) return p;
      const next = [...p];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function makePrimary(id: string) {
    setPhotos((p) => {
      const idx = p.findIndex((x) => x.id === id);
      if (idx <= 0) return p;
      const next = [...p];
      const [picked] = next.splice(idx, 1);
      next.unshift(picked);
      return next;
    });
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
          dragging
            ? "border-gather-brown bg-gather-cream/60"
            : "border-gather-teal/35 bg-gather-paper/40 hover:border-gather-accent hover:bg-white"
        }`}
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 text-gather-brown-mid"
        >
          <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          <path d="M12 4v12" />
          <path d="M7 9l5-5 5 5" />
        </svg>
        <p className="text-sm font-semibold text-gather-ink">
          Drop photos here or click to browse
        </p>
        <p className="text-xs text-gather-charcoal/80">
          JPG, PNG, WEBP, GIF, or HEIC, up to 8 MB each. Fun GIFs welcome.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) void uploadFiles(files);
            e.target.value = "";
          }}
        />
      </div>

      {uploading ? (
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-gather-brown-mid">
          Uploading {progress?.done ?? 0} / {progress?.total ?? 0}…
        </p>
      ) : null}

      <div className="mt-3 flex gap-2">
        <input
          type="url"
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addFromUrl();
            }
          }}
          placeholder="Or paste an image URL"
          className="flex-1 rounded-xl border border-gather-teal/25 bg-white px-4 py-2.5 text-sm text-gather-ink outline-none transition placeholder:text-gather-charcoal/55 focus:border-gather-accent focus:ring-2 focus:ring-gather-accent/40"
        />
        <button
          type="button"
          onClick={addFromUrl}
          className="shrink-0 rounded-xl border border-gather-teal/35 bg-white px-4 py-2.5 text-sm font-semibold text-gather-brown transition hover:border-gather-brown hover:bg-gather-paper"
        >
          Add
        </button>
      </div>

      {error ? (
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </p>
      ) : null}

      {notice ? (
        <p className="mt-3 rounded-xl bg-gather-cream/60 px-3 py-2 text-xs leading-relaxed text-gather-brown-mid ring-1 ring-gather-accent/20">
          {notice}
        </p>
      ) : null}

      {photos.length > 0 ? (
        <ul className="mt-4 grid grid-cols-3 gap-2">
          {photos.map((ph, i) => (
            <li
              key={ph.id}
              className={`group relative aspect-square overflow-hidden rounded-xl ring-1 ring-black/[0.06] ${
                i === 0 ? "ring-2 ring-gather-brown" : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ph.url}
                alt=""
                className="h-full w-full object-cover"
              />
              {i === 0 ? (
                <span className="absolute left-1 top-1 rounded-full bg-gather-brown px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-gather-cream shadow-sm">
                  Primary
                </span>
              ) : null}
              <div className="absolute inset-x-1 bottom-1 flex items-center justify-between gap-1 opacity-0 transition group-hover:opacity-100">
                <div className="flex gap-1">
                  {i > 0 ? (
                    <IconBtn
                      label="Move up"
                      onClick={() => move(ph.id, -1)}
                    >
                      ↑
                    </IconBtn>
                  ) : null}
                  {i < photos.length - 1 ? (
                    <IconBtn
                      label="Move down"
                      onClick={() => move(ph.id, +1)}
                    >
                      ↓
                    </IconBtn>
                  ) : null}
                  {i > 0 ? (
                    <IconBtn
                      label="Make primary"
                      onClick={() => makePrimary(ph.id)}
                    >
                      P
                    </IconBtn>
                  ) : null}
                </div>
                <IconBtn label="Remove" onClick={() => remove(ph.id)} danger>
                  ×
                </IconBtn>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <input ref={hiddenRef} type="hidden" name={name} defaultValue={value} />
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white shadow-sm backdrop-blur transition ${
        danger
          ? "bg-red-500/90 hover:bg-red-600"
          : "bg-black/55 hover:bg-black/75"
      }`}
    >
      {children}
    </button>
  );
}
