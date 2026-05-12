import Link from "next/link";
import { createGathering } from "@/app/actions/gathering";
import { GatheringType } from "@prisma/client";
import { getUsedNeighborhoods } from "@/lib/neighborhoods";
import { NeighborhoodInput } from "@/components/neighborhood-input";
import { SectionTitle } from "@/components/ui/page-header";
import { HostBudgetRange } from "@/components/host-budget-range";
import { CustomizeCoverCollapsible } from "@/components/host/customize-cover-collapsible";
import { GatheringFormSubmitBar } from "@/components/host/gathering-form-submit-bar";

const types: GatheringType[] = [
  GatheringType.HOME,
  GatheringType.PUBLIC,
  GatheringType.OTHER,
];

export default async function NewGatheringPage() {
  const usedNeighborhoods = await getUsedNeighborhoods();

  return (
    <div className="pb-28">
      <div className="mx-auto max-w-[900px]">
        <Link
          href="/host"
          className="inline-flex items-center gap-1 text-[15px] text-lc-settings-label transition hover:text-gather-brown"
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

        <form
          id="new-gathering-form"
          action={createGathering}
          className="mt-7 space-y-10 sm:mt-9"
        >
          <Group title="Gathering basics">
            <div className="space-y-10">
              <Field label="Title" weight="primary" required>
                <input name="title" required className={inputTitle} />
              </Field>

              <div className="space-y-8">
                <Field label="Neighborhood (public)" weight="key" required>
                  <NeighborhoodInput
                    name="neighborhood"
                    required
                    extras={usedNeighborhoods}
                    className={inputKey}
                  />
                </Field>
                <Field label="Starts at" weight="key" required>
                  <input
                    name="startsAt"
                    type="datetime-local"
                    required
                    className={inputKey}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-6 sm:gap-8">
                <Field label="Min group size" weight="key" required>
                  <input
                    name="minTotalSize"
                    type="number"
                    min={1}
                    defaultValue={5}
                    required
                    className={inputKey}
                  />
                </Field>
                <Field label="Max group size" weight="key" required>
                  <input
                    name="maxTotalSize"
                    type="number"
                    min={1}
                    defaultValue={7}
                    required
                    className={inputKey}
                  />
                </Field>
              </div>

              <Field label="Description" weight="body" required>
                <textarea
                  name="description"
                  required
                  rows={7}
                  className={textareaBody}
                  placeholder="What should guests expect?"
                />
              </Field>

              <Field label="Type" weight="key" required>
                <select name="gatheringType" required className={inputStandard}>
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="pt-1">
                <CustomizeCoverCollapsible />
              </div>
            </div>
          </Group>

          <Group title="Private address">
            <Field
              label="Full address"
              hint="Hidden until a guest is approved."
              weight="muted"
              required
            >
              <input name="addressSecret" required className={inputStandard} />
            </Field>
          </Group>

          <Group title="Who & how">
            <div className="space-y-8">
              <Field label="Optional question for applicants" weight="muted">
                <input
                  name="applicantQuestion"
                  className={inputStandard}
                />
              </Field>
              <Field
                label="Token cost"
                hint="0 for free. Maximum 5 tokens per guest."
                weight="muted"
                required
              >
                <input
                  name="tokenCost"
                  type="number"
                  min={0}
                  max={5}
                  defaultValue={1}
                  required
                  className={inputStandard}
                />
              </Field>
              <Field label="Event budget explanation" weight="muted">
                <textarea name="budgetExplanation" rows={3} className={textareaStd} />
              </Field>
              <Field
                label="Friends already coming"
                hint="No tokens required from them."
                weight="muted"
                required
              >
                <input
                  name="hostFriendsCount"
                  type="number"
                  min={0}
                  defaultValue={0}
                  required
                  className={inputStandard}
                />
              </Field>
            </div>
          </Group>

          <p className="text-center text-[13px] leading-[1.45] text-lc-settings-helper italic">
            *By creating this gathering, I affirm that any funds collected are
            intended solely for shared costs and not for personal profit.
          </p>

          <HostBudgetRange formId="new-gathering-form" />

          <GatheringFormSubmitBar />
        </form>

      </div>
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
      <SectionTitle title={title} variant="gatheringBasics" />
      <div className="space-y-9 rounded-2xl border border-gather-teal/25 bg-lc-settings-parchment-soft/95 p-6 shadow-sm ring-1 ring-black/[0.04] sm:p-8">
        {children}
      </div>
    </section>
  );
}

type FieldWeight = "primary" | "key" | "body" | "muted";

function Field({
  label,
  hint,
  required,
  weight = "muted",
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  weight?: FieldWeight;
  children: React.ReactNode;
}) {
  let labelCls: string;
  if (weight === "primary") {
    labelCls =
      "flex items-baseline gap-1.5 text-[14px] font-semibold tracking-tight text-lc-settings-ink-strong sm:text-[15px]";
  } else if (weight === "key" || weight === "body") {
    labelCls =
      "flex items-baseline gap-1.5 text-[14px] font-semibold uppercase tracking-[0.08em] text-lc-settings-label";
  } else {
    labelCls =
      "flex items-baseline gap-1.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-lc-settings-label sm:text-[14px]";
  }

  return (
    <div>
      <label className={labelCls}>
        <span>{label}</span>
        {required ? (
          <span className="text-gather-accent" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      {hint ? (
        <p className="mt-1 text-[13px] leading-[1.45] text-lc-settings-helper">{hint}</p>
      ) : null}
      <div className={`${weight === "body" ? "mt-3" : "mt-2"}`}>{children}</div>
    </div>
  );
}

const placeholder =
  "placeholder:text-[#6f625a]";
const ringFocus =
  "outline-none transition focus:border-gather-accent focus:ring-2 focus:ring-gather-accent/40";

const inputBase = `w-full rounded-xl border border-gather-teal/25 bg-white px-4 text-[15px] text-gather-ink ${placeholder} ${ringFocus}`;

const inputTitle =
  `${inputBase} py-4 text-[17px] font-semibold leading-snug placeholder:font-normal sm:text-[18px]`;

const inputKey = `${inputBase} py-3.5`;
const inputStandard = `${inputBase} py-3.5`;

const textareaBody =
  `${inputBase} min-h-[12rem] resize-y py-3.5 leading-[1.55]`;

const textareaStd = `${inputBase} min-h-[6.5rem] resize-y py-3.5 leading-relaxed`;
