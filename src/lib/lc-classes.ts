/**
 * Repeated Tailwind class groups for candlelit UI.
 * Palette tokens live in `globals.css` (`lc-*` theme colors).
 */
export const lcChrome = {
  /** Top chrome bar (matches signed-in `(main)` header feel). */
  headerBar:
    "relative z-10 flex justify-center border-b border-white/10 bg-lc-espresso/80 px-4 py-3 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] backdrop-blur-md supports-[backdrop-filter]:bg-lc-espresso/55",

  stickyMarketingHeaderBar:
    "sticky top-0 z-30 -mx-5 mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-lc-warm-shadow/40 bg-lc-bg-void/65 px-5 py-4 backdrop-blur-md sm:-mx-8 sm:px-8 lg:-mx-14 lg:px-14",

  bottomNav:
    "fixed bottom-0 left-0 right-0 z-40 border-t border-lc-warm-shadow/55 bg-[rgb(34_17_13_/_0.94)] pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-14px_40px_-28px_rgb(12_7_9_/_0.55)] backdrop-blur-md supports-[backdrop-filter]:bg-[rgb(34_17_13_/_0.88)]",

  navIconActive: "text-lc-cream drop-shadow-[0_0_10px_rgb(243_226_219_/_0.18)]",
  navIconIdle:
    "text-lc-caption-warm/[0.85] hover:text-lc-cream",

  pillUnderline: "bg-lc-dusty-blue",

  /** Primary ghost / glass controls on photo backgrounds */
  roundControlIdle:
    "border-lc-pale-blue-border/40 bg-lc-espresso/55 text-lc-cream shadow-md backdrop-blur-sm transition hover:border-lc-cream/65 hover:bg-lc-warm-shadow/75",

  mutedBody: "text-lc-cream/55",
  body: "text-lc-cream",

  subtitle: "text-lc-cream/88",

  tabActiveSolid: "text-lc-tan-accent",
  tabInactiveMuted: "text-lc-tab-muted hover:text-lc-tan-accent",
  tabAccentUnderline: "bg-lc-cream",
  tabMutedUnderline: "text-lc-tab-muted hover:text-lc-tan-accent",
} as const;
