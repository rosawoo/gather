"use client";

import { useState } from "react";
import { requestPhoneCode, verifyPhoneCode } from "@/app/actions/phone";

const inputCls =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gather-ink outline-none transition placeholder:text-neutral-400 focus:border-gather-accent focus:ring-2 focus:ring-gather-accent/40";

export function PhoneForm() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [tone, setTone] = useState<"info" | "error">("info");
  const [pending, setPending] = useState(false);

  async function onRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMsg(null);
    try {
      await requestPhoneCode(phone);
      setTone("info");
      setMsg("Code sent. Check your phone — or use 202600 in dev.");
    } catch {
      setTone("error");
      setMsg("Could not send code. Try again.");
    } finally {
      setPending(false);
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMsg(null);
    try {
      await verifyPhoneCode(phone, code);
    } catch {
      setTone("error");
      setMsg("Invalid or expired code.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <form onSubmit={onRequestCode} className="space-y-3">
        <label className="flex items-baseline gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gather-brown-mid">
          Phone number
        </label>
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 555 555 5555"
          className={inputCls}
        />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-gather-brown py-3 text-sm font-semibold text-gather-cream shadow-sm transition hover:bg-gather-brown-mid active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send code"}
        </button>
      </form>

      <form onSubmit={onVerify} className="space-y-3">
        <label className="flex items-baseline gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gather-brown-mid">
          SMS code
        </label>
        <input
          type="text"
          required
          inputMode="numeric"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="6-digit code"
          className={`${inputCls} tracking-[0.3em]`}
        />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full border border-gather-brown py-3 text-sm font-semibold text-gather-brown transition hover:bg-gather-brown hover:text-gather-cream disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Verifying…" : "Verify"}
        </button>
      </form>

      {msg ? (
        <p
          className={`rounded-xl px-3 py-2 text-sm ${
            tone === "error"
              ? "bg-red-50 text-red-700 ring-1 ring-red-200"
              : "bg-gather-paper/80 text-neutral-700 ring-1 ring-neutral-200"
          }`}
        >
          {msg}
        </p>
      ) : null}
    </div>
  );
}
