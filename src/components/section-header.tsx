"use client";

export function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-6 border-b border-neutral-200 pb-3">
      <h1 className="text-center text-lg font-semibold text-gather-ink">
        {title}
      </h1>
    </div>
  );
}
