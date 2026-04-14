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
      <Link href="/gatherings" className="inline-flex items-center gap-1 text-sm text-gather-brown hover:underline">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" /></svg>
        Back
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
