"use server";

import { signIn, signOut } from "@/auth";

function safeInternalPath(raw: unknown): string {
  if (typeof raw !== "string") return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  if (raw.includes("://") || raw.includes("..")) return "/";
  return raw;
}

export async function signInWithGoogle(formData: FormData) {
  const path = safeInternalPath(formData.get("callbackUrl"));
  await signIn("google", { redirectTo: path });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
