import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthConfig } from "next-auth";
import { prisma } from "@/lib/prisma";

let loggedProdAuthEnv = false;

function logProdAuthEnvOnce() {
  if (loggedProdAuthEnv || process.env.NODE_ENV !== "production") return;
  loggedProdAuthEnv = true;
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "";
  const googleId =
    process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "";
  const googleSecret =
    process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
  if (!secret) {
    console.error(
      "[Gather/auth] AUTH_SECRET (or NEXTAUTH_SECRET) is missing at runtime — Auth.js returns “Server error”. " +
        "Confirm it is enabled for this environment (Production vs Preview) and redeploy.",
    );
  } else if (process.env.AUTH_DEBUG === "1") {
    console.info("[Gather/auth] AUTH_SECRET present");
  }
  if (!googleId || !googleSecret) {
    console.error(
      "[Gather/auth] Google OAuth env vars missing — set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET for this environment.",
    );
  }
}

function buildAuthConfig(): NextAuthConfig {
  logProdAuthEnvOnce();

  const googleClientId =
    process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "";
  const googleClientSecret =
    process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";

  if (process.env.NODE_ENV === "development") {
    if (!googleClientId || !googleClientSecret) {
      console.warn(
        "\n[Gather] Missing Google OAuth env vars. Add to .env:\n" +
          "  AUTH_GOOGLE_ID=...     (Client ID from Google Cloud Console)\n" +
          "  AUTH_GOOGLE_SECRET=... (Client secret)\n" +
          "Authorized redirect URIs should include e.g.\n" +
          "  http://127.0.0.1:3001/api/auth/callback/google\n" +
          "  http://localhost:3001/api/auth/callback/google\n" +
          "If you used a LAN URL (192.168…), set AUTH_URL=http://localhost:3001 in .env and open localhost.\n",
      );
    }
  }

  return {
    adapter: PrismaAdapter(prisma),
    trustHost: true,
    providers: [
      Google({
        clientId: googleClientId,
        clientSecret: googleClientSecret,
      }),
    ],
    pages: {
      signIn: "/sign-in",
    },
    callbacks: {
      session({ session, user }) {
        if (session.user) session.user.id = user.id;
        return session;
      },
    },
    /**
     * Surfaced in Vercel logs (set AUTH_DEBUG=1 temporarily).
     * Auth.js also maps many thrown errors (e.g. Prisma) to “Configuration”.
     */
    debug: process.env.AUTH_DEBUG === "1",
    events: {
      signIn(message) {
        if (process.env.AUTH_DEBUG === "1") {
          console.info("[Gather/auth] signIn event", {
            userId: message.user?.id,
            isNewUser: message.isNewUser,
          });
        }
      },
    },
  };
}

/**
 * Lazy factory so `setEnvDefaults` runs per request — avoids a stale empty
 * secret if the module was first loaded in an odd context.
 */
export const { handlers, auth, signIn, signOut } =
  NextAuth(buildAuthConfig);
