import Link from "next/link";
import { auth } from "@/auth";
import { submitReport } from "@/app/actions/report";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; id?: string }>;
}) {
  await auth();
  const sp = await searchParams;
  const targetType = sp.type === "gathering" ? "gathering" : "user";
  const targetId = sp.id ?? "";

  return (
    <div className="px-4 pb-28">
      <Link href="/gatherings" className="text-sm text-gather-brown hover:underline">
        ← Back
      </Link>
      <h1 className="mt-4 text-xl font-semibold">Report</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Tell us what happened. Our team reviews every submission.
      </p>
      <form action={submitReport} className="mt-6 space-y-4">
        <input type="hidden" name="targetType" value={targetType} />
        <input type="hidden" name="targetId" value={targetId} />
        <textarea
          name="body"
          required
          rows={6}
          placeholder="Describe the issue…"
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none ring-gather-accent focus:ring-2"
        />
        <button
          type="submit"
          className="w-full rounded-full bg-gather-brown py-3 text-sm font-medium text-gather-cream"
        >
          Submit report
        </button>
      </form>
    </div>
  );
}
