import type { Metadata } from "next";
import Link from "next/link";
import { CandlelitPageShell } from "@/components/landing/candlelit-page-shell";
import { AboutContent } from "./about-content";

export const metadata: Metadata = {
  title: "How it works — Gather",
  description:
    "Create a profile, find or host gatherings, request a seat, and show up—Gather is for hosts and guests who want real rooms, not feeds.",
};

export default function AboutPage() {
  return (
    <CandlelitPageShell headerSticky backdrop="manifesto">
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <main className="w-full flex-1 pb-6 pt-2 sm:pb-10 sm:pt-4">
          <AboutContent />
        </main>
        <footer className="about-manifesto-footer" aria-label="Site footer">
          <div className="about-manifesto-footer-line" aria-hidden />
          <p className="about-manifesto-footer-copy">
            © {new Date().getFullYear()} gather
          </p>
          <nav
            className="about-manifesto-footer-links"
            aria-label="Legal and community"
          >
            <Link href="/terms-of-service">terms</Link>
            <Link href="/privacy-policy">privacy</Link>
            <Link href="/community-guidelines">community</Link>
          </nav>
        </footer>
      </div>
    </CandlelitPageShell>
  );
}
