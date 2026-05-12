import Link from "next/link";
import { createGathering } from "@/app/actions/gathering";
import { GatheringType } from "@prisma/client";
import { getUsedNeighborhoods } from "@/lib/neighborhoods";
import { NeighborhoodInput } from "@/components/neighborhood-input";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { HostBudgetRange } from "@/components/host-budget-range";
import { CoverEditor } from "@/components/cover-editor";

const types: GatheringType[] = [
  GatheringType.HOME,
  GatheringType.PUBLIC,
  GatheringType.OTHER,
];

export default async function NewGatheringPage() {
  const usedNeighborhoods = await getUsedNeighborhoods();

  return (
    <div className="pb-10">
      <Link
        href="/host"
        className="inline-flex items-center gap-1 text-sm text-gather-brown-mid transition hover:text-gather-brown"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
            clipRule="evenodd"
          />
        </svg>
        Back
      </Link>

      <div className="mt-5">
        <PageHeader
          title="Host a gathering"
          subtitle="Set the stage. You can refine details after publishing."
        />
      </div>

      <form id="new-gathering-form" action={createGathering} className="space-y-8">
        <Group title="The basics">
          <Field label="Title" required>
            <input name="title" required className={input} />
          </Field>
          <Field label="Cover art" hint="Pick a template or paste a URL.">
            <CoverEditor />
          </Field>
          <Field label="Description" required>
            <textarea name="description" required rows={4} className={input} />
          </Field>
          <Field label="Type" required>
            <select name="gatheringType" required className={input}>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
        </Group>

        <Group title="Where & when">
          <Field label="Neighborhood (public)" required>
            <NeighborhoodInput
              name="neighborhood"
              required
              extras={usedNeighborhoods}
              className={input}
            />
          </Field>
          <Field label="Full address" hint="Hidden until a guest is approved." required>
            <input name="addressSecret" required className={input} />
          </Field>
          <Field label="Starts at" required>
            <input
              name="startsAt"
              type="datetime-local"
              required
              className={input}
            />
          </Field>
        </Group>

        <Group title="Who & how">
          <Field label="Optional question for applicants">
            <input name="applicantQuestion" className={input} />
          </Field>
          <Field label="Token cost" hint="0 for free. Maximum 5 tokens per guest." required>
            <input
              name="tokenCost"
              type="number"
              min={0}
              max={5}
              defaultValue={1}
              required
              className={input}
            />
          </Field>
          <Field label="Event budget explanation">
            <textarea name="budgetExplanation" rows={2} className={input} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Min group size" required>
              <input
                name="minTotalSize"
                type="number"
                min={1}
                defaultValue={5}
                required
                className={input}
              />
            </Field>
            <Field label="Max group size" required>
              <input
                name="maxTotalSize"
                type="number"
                min={1}
                defaultValue={7}
                required
                className={input}
              />
            </Field>
          </div>
          <Field
            label="Friends already coming"
            hint="No tokens required from them."
            required
          >
            <input
              name="hostFriendsCount"
              type="number"
              min={0}
              defaultValue={0}
              required
              className={input}
            />
          </Field>
        </Group>

        <HostBudgetRange formId="new-gathering-form" />

        <p className="text-center text-xs italic text-neutral-600">
          *By creating this gathering, I affirm that any funds collected are
          intended solely for shared costs and not for personal profit.
        </p>

        <button
          type="submit"
          className="w-full rounded-full bg-gather-brown py-3.5 text-sm font-semibold text-gather-cream shadow-sm transition hover:bg-gather-brown-mid active:scale-[0.99]"
        >
          Post gathering
        </button>
      </form>
    </div>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <SectionTitle title={title} />
      <div className="space-y-4 rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm ring-1 ring-black/[0.02]">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-baseline gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gather-brown-mid">
        <span>{label}</span>
        {required ? (
          <span className="text-gather-accent" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      {hint ? (
        <p className="mt-0.5 text-xs text-neutral-500">{hint}</p>
      ) : null}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

const input =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gather-ink outline-none transition placeholder:text-neutral-400 focus:border-gather-accent focus:ring-2 focus:ring-gather-accent/40";
