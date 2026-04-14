"use client";

export function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-6 flex border-b border-neutral-200">
      <div className="flex-1 border-b-2 border-gather-brown py-3 text-center text-sm font-medium text-gather-brown">
        {title}
      </div>
    </div>
  );
}
