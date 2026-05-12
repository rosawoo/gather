"use client";

import { useState } from "react";
import { requestPhoneCode, verifyPhoneCode } from "@/app/actions/phone";
import { isRedirectError } from "next/dist/client/components/redirect-error";

const inputCls =
  "w-full rounded-xl border border-gather-teal/25 bg-white px-4 py-3 text-sm text-gather-ink outline-none transition placeholder:text-gather-charcoal/55 focus:border-gather-accent focus:ring-2 focus:ring-gather-accent/40";

function errMessage(e: unknown) {
  return e instanceof Error ? e.message : "Something went wrong";
}

type PhoneFormProps = {
  /** True when Twilio env vars are missing on a production build (e.g. Vercel). */
  showSmsConfigWarning?: boolean;
  /** SID / FROM format problems when vars appear set — SMS will fail until Vercel env is corrected. */
  twilioEnvShapeIssue?: string;
};

export function PhoneForm({
  showSmsConfigWarning = false,
  twilioEnvShapeIssue,
}: PhoneFormProps) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [smsDiagHint, setSmsDiagHint] = useState<string | null>(null);
  const [tone, setTone] = useState<"info" | "error">("info");
  const [pending, setPending] = useState(false);

  async function onRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMsg(null);
    setSmsDiagHint(null);
    try {
      const result = await requestPhoneCode(phone);
      if (!result.ok) {
        setTone("error");
        setMsg(result.error);
      } else {
        setTone("info");
        if (result.channel === "sms") {
          setMsg("Code sent. Check your phone for the text.");
          setSmsDiagHint(
            "If nothing arrives within a minute, check Twilio Console → Monitor → Logs for this destination. Successful sends log Message SIDs server-side ([sms:sent]); “queued” can still fail afterward (carrier, trial limits, STOP, or geo).",
          );
        } else {
          setMsg(result.detail);
        }
      }
    } catch (e) {
      setTone("error");
      setMsg(errMessage(e));
    } finally {
      setPending(false);
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMsg(null);
    setSmsDiagHint(null);
    try {
      const result = await verifyPhoneCode(phone, code);
      if (result?.ok === false) {
        setTone("error");
        setMsg(result.error);
      }
    } catch (e) {
      if (isRedirectError(e)) throw e;
      setTone("error");
      setMsg(errMessage(e));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      {showSmsConfigWarning ? (
        <div
          className="rounded-xl border border-amber-200/90 bg-amber-50/95 px-4 py-3 text-sm text-amber-950 shadow-sm"
          role="status"
        >
          <p className="font-semibold">SMS isn’t enabled on this deployment</p>
          <p className="mt-1.5 leading-relaxed text-amber-950/90">
            This server is missing Twilio environment variables, so codes can’t
            be sent. You can skip this step for now, or ask the team to add{" "}
            <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">
              TWILIO_ACCOUNT_SID
            </code>
            ,{" "}
            <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">
              TWILIO_AUTH_TOKEN
            </code>
            , and{" "}
            <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">
              TWILIO_FROM_NUMBER
            </code>{" "}
            (or{" "}
            <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">
              TWILIO_MESSAGING_SERVICE_SID
            </code>
            ) in Vercel Production and redeploy.
          </p>
        </div>
      ) : null}

      {twilioEnvShapeIssue && !showSmsConfigWarning ? (
        <div
          className="rounded-xl border border-amber-200/90 bg-amber-50/95 px-4 py-3 text-sm text-amber-950 shadow-sm"
          role="alert"
        >
          <p className="font-semibold">Twilio SMS is misconfigured on the server</p>
          <p className="mt-2 leading-relaxed text-amber-950/95">{twilioEnvShapeIssue}</p>
        </div>
      ) : null}

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

      {msg ? (
        <div
          role="alert"
          aria-live="polite"
          className={`rounded-xl px-3 py-2 text-sm ${
            tone === "error"
              ? "bg-red-50 text-red-700 ring-1 ring-red-200"
              : "bg-gather-paper/80 text-gather-ink ring-1 ring-gather-teal/20"
          }`}
        >
          <p>{msg}</p>
          {tone === "info" && smsDiagHint ? (
            <p className="mt-2 text-xs leading-relaxed text-gather-charcoal/82">
              {smsDiagHint}
            </p>
          ) : null}
        </div>
      ) : null}

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
    </div>
  );
}
