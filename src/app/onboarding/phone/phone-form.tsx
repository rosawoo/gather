"use client";

import { useState } from "react";
import { requestPhoneCode, verifyPhoneCode } from "@/app/actions/phone";

export function PhoneForm() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMsg(null);
    try {
      await requestPhoneCode(phone);
      setMsg("Code sent. Check your phone — or use 202600 in dev.");
    } catch {
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
      setMsg("Invalid or expired code.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-8 space-y-8">
      <form onSubmit={onRequestCode} className="space-y-3">
        <label className="block text-xs font-medium uppercase tracking-wide text-neutral-500">
          Phone number
        </label>
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 …"
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none ring-gather-accent focus:ring-2"
        />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-gather-brown py-3 text-sm font-medium text-gather-cream disabled:opacity-50"
        >
          Send code
        </button>
      </form>

      <form onSubmit={onVerify} className="space-y-3">
        <label className="block text-xs font-medium uppercase tracking-wide text-neutral-500">
          SMS code
        </label>
        <input
          type="text"
          required
          inputMode="numeric"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="6-digit code"
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none ring-gather-accent focus:ring-2"
        />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full border border-gather-brown py-3 text-sm font-medium text-gather-brown disabled:opacity-50"
        >
          Verify
        </button>
      </form>
      {msg ? <p className="text-sm text-neutral-600">{msg}</p> : null}
    </div>
  );
}
