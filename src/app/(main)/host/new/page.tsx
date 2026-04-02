import Link from "next/link";
import { createGathering } from "@/app/actions/gathering";
import { GatheringType } from "@prisma/client";

const types: GatheringType[] = [
  GatheringType.HOME,
  GatheringType.PUBLIC,
  GatheringType.OTHER,
];

export default function NewGatheringPage() {
  return (
    <div className="px-4 pb-28">
      <Link href="/host" className="text-sm text-gather-brown hover:underline">
        ← Host
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
          <input name="neighborhood" required className={input} />
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
