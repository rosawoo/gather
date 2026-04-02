import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

/** Auth.js prefers AUTH_GOOGLE_ID; some docs use GOOGLE_CLIENT_ID — accept both. */
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
        "Authorized redirect URI must include:\n" +
        "  http://localhost:3001/api/auth/callback/google\n",
    );
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
});
