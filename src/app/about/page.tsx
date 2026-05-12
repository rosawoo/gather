import type { Metadata } from "next";
import { CandlelitPageShell } from "@/components/landing/candlelit-page-shell";
import { AboutContent } from "./about-content";

export const metadata: Metadata = {
  title: "How it works — Gather",
  description:
    "Create a profile, find or host gatherings, request a seat, and show up—Gather is for hosts and guests who want real rooms, not feeds.",
};

export default function AboutPage() {
  return (
    <CandlelitPageShell headerSticky>
      <main className="w-full flex-1 pb-16">
        <AboutContent />
      </main>
    </CandlelitPageShell>
  );
}
