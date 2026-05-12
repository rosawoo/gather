import { SectionTitle } from "@/components/ui/page-header";

export const profileInputCls =
  "w-full rounded-xl border border-gather-teal/25 bg-white px-4 py-3 text-sm text-gather-ink outline-none transition placeholder:text-gather-charcoal/55 focus:border-gather-accent focus:ring-2 focus:ring-gather-accent/40";

export function ProfileFieldGroup({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <SectionTitle title={title} />
      {hint ? (
        <p className="-mt-2 mb-3 text-sm leading-snug text-gather-charcoal/85">{hint}</p>
      ) : null}
      <div className="space-y-4 rounded-2xl border border-gather-teal/25 bg-white p-4 shadow-sm ring-1 ring-gather-teal/10">
        {children}
      </div>
    </section>
  );
}

export function ProfileField({
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
      <label className="flex items-baseline gap-1.5 text-sm font-semibold uppercase tracking-[0.1em] text-gather-brown-mid">
        <span>{label}</span>
        {required ? (
          <span className="text-gather-accent" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      {hint ? (
        <p className="mt-0.5 text-sm leading-snug text-gather-charcoal/85">{hint}</p>
      ) : null}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
