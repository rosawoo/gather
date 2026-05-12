export function TokenExplainer({
  className = "",
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "onDark";
}) {
  const tone =
    variant === "onDark" ? "text-gather-cream/75" : "text-gather-charcoal";
  return (
    <p className={`text-xs leading-relaxed ${tone} ${className}`.trim()}>
      Tokens are for cost-sharing: they help cover food, drinks, reservations,
      materials, and similar shared expenses. They are not meant for the host to
      profit. They also help ensure commitment and reduce no-shows.
    </p>
  );
}
