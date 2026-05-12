import type { Metadata } from "next";
import { CandlelitPageShell } from "@/components/landing/candlelit-page-shell";
import { PrivacyDocument } from "./privacy-document";

export const metadata: Metadata = {
  title: "Privacy policy · Gather",
  description:
    "How Gather collects, uses, and shares information when you use the platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <CandlelitPageShell headerSticky>
      <main className="w-full flex-1 pb-16">
        <PrivacyDocument />
      </main>
    </CandlelitPageShell>
  );
}
