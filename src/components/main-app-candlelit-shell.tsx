/**
 * Signed-in app shell: matches sign-in/backdrop typography (landing-candlelit) and photo scrim.
 * Polaroids / cards supply their own light surfaces inside.
 */
export function MainAppCandlelitShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="landing-candlelit relative min-h-full overflow-x-hidden bg-lc-bg-void text-lc-cream">
      <div className="landing-candlelit-bg fixed inset-0 -z-20 bg-lc-bg-void" aria-hidden />
      <div className="landing-candlelit-vignette fixed inset-0 -z-10" aria-hidden />
      {children}
    </div>
  );
}
