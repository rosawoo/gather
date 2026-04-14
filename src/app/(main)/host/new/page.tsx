import Link from "next/link";
import { createGathering } from "@/app/actions/gathering";
import { GatheringType } from "@prisma/client";
import { getUsedNeighborhoods } from "@/lib/neighborhoods";
import { NeighborhoodInput } from "@/components/neighborhood-input";

const types: GatheringType[] = [
  GatheringType.HOME,
  GatheringType.PUBLIC,
  GatheringType.OTHER,
];

export default async function NewGatheringPage() {
  const usedNeighborhoods = await getUsedNeighborhoods();

  return (
    <div className="pb-10">
      <Link href="/host" className="inline-flex items-center gap-1 text-sm text-gather-brown hover:underline">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" /></svg>
        Back
      </Link>
      <h1 className="mt-4 text-xl font-semibold">Host a gathering</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Cover photo: paste an image URL for now. Template editor (Partiful-style)
        can layer on later.
      </p>

      <form action={createGathering} className="mt-8 space-y-5">
        <Field label="Title *">
          <input name="title" required className={input} />
        </Field>
        <Field label="Cover image URL">
          <input name="coverImageUrl" type="url" className={input} />
        </Field>
        <Field label="Description *">
          <textarea name="description" required rows={4} className={input} />
        </Field>
        <Field label="Type *">
          <select name="gatheringType" required className={input}>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Neighborhood (public) *">
          <NeighborhoodInput name="neighborhood" required extras={usedNeighborhoods} className={input} />
        </Field>
        <Field label="Full address (hidden until approval) *">
          <input name="addressSecret" required className={input} />
        </Field>
        <Field label="Starts at *">
          <input name="startsAt" type="datetime-local" required className={input} />
        </Field>
        <Field label="Optional question for applicants">
          <input name="applicantQuestion" className={input} />
        </Field>
        <Field label="Token cost (0 for free) *">
          <input
            name="tokenCost"
            type="number"
            min={0}
            defaultValue={1}
            required
            className={input}
          />
        </Field>
        <Field label="Event budget explanation">
          <textarea name="budgetExplanation" rows={2} className={input} />
        </Field>
        <Field label="Min total group size *">
          <input
            name="minTotalSize"
            type="number"
            min={1}
            defaultValue={5}
            required
            className={input}
          />
        </Field>
        <Field label="Max total group size *">
          <input
            name="maxTotalSize"
            type="number"
            min={1}
            defaultValue={7}
            required
            className={input}
          />
        </Field>
        <Field label="Friends already coming (no tokens) *">
          <input
            name="hostFriendsCount"
            type="number"
            min={0}
            defaultValue={0}
            required
            className={input}
          />
        </Field>
        <button
          type="submit"
          className="w-full rounded-full bg-gather-brown py-3.5 text-sm font-medium text-gather-cream"
        >
          Post gathering
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

const input =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none ring-gather-accent focus:ring-2";
