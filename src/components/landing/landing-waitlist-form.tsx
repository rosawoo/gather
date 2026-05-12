"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

export function LandingWaitlistForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    const q = trimmed ? `?email=${encodeURIComponent(trimmed)}` : "";
    router.push(`/sign-up${q}`);
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-[320px] space-y-3">
      <label className="sr-only" htmlFor="landing-email">
        Email
      </label>
      <input
        id="landing-email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="landing-input-email"
      />
      <button type="submit" className="landing-btn-cta">
        get on the list
      </button>
    </form>
  );
}
