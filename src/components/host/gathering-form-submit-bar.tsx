"use client";

type Props = {
  /** When omitted, the submit button must live inside the target `<form>` (tab order + no `form` attribute). */
  formId?: string;
};

/** Sticky primary CTA for long host forms — use `formId` only when this bar sits outside the form. */
export function GatheringFormSubmitBar({ formId }: Props) {
  return (
    <div className="pointer-events-none sticky bottom-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] z-20 mx-auto mt-12 flex max-w-[900px] justify-center px-0 sm:bottom-[calc(env(safe-area-inset-bottom,0px)+5rem)]">
      <div className="pointer-events-auto w-full px-2 sm:px-0">
        <div className="rounded-2xl border border-gather-brown/35 bg-gather-paper/95 px-4 py-3 shadow-[0_-14px_40px_-20px_rgb(23_17_17_/_0.45)] ring-1 ring-gather-teal/15 backdrop-blur-md supports-[backdrop-filter]:bg-gather-paper/90">
          <button
            type="submit"
            form={formId}
            className="w-full rounded-full bg-gather-brown py-3.5 text-[15px] font-semibold text-gather-cream shadow-[0_2px_14px_-4px_rgb(70_42_42_/_0.45)] transition hover:bg-gather-brown-mid active:scale-[0.99]"
          >
            Post gathering
          </button>
          <p className="mt-2 text-center text-[13px] leading-[1.45] text-lc-settings-helper">
            Review budget & disclaimers above before you submit.
          </p>
        </div>
      </div>
    </div>
  );
}
