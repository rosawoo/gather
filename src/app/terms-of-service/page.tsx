import type { Metadata } from "next";
import { CandlelitPageShell } from "@/components/landing/candlelit-page-shell";
import { TermsDocument } from "./terms-document";

export const metadata: Metadata = {
  title: "Terms of service — Gather",
  description:
    "Terms of service for the Gather platform. Warm, bookish legal copy for hosts and guests.",
};

export default function TermsOfServicePage() {
  return (
    <CandlelitPageShell headerSticky>
      <main className="w-full flex-1 pb-16">
        <TermsDocument />
      </main>
    </CandlelitPageShell>
  );
}
