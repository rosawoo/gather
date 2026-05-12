import type { Metadata } from "next";
import { CandlelitPageShell } from "@/components/landing/candlelit-page-shell";
import { CommunityGuidelinesDocument } from "./community-guidelines-document";

export const metadata: Metadata = {
  title: "Community guidelines · Gather",
  description:
    "What we expect from hosts, guests, and everyone on Gather: respectful, safe, real-life gatherings.",
};

export default function CommunityGuidelinesPage() {
  return (
    <CandlelitPageShell headerSticky>
      <main className="w-full flex-1 pb-16">
        <CommunityGuidelinesDocument />
      </main>
    </CandlelitPageShell>
  );
}
