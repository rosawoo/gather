export function TokenExplainer({ className = "" }: { className?: string }) {
  return (
    <p
      className={`text-xs leading-relaxed text-neutral-600 ${className}`.trim()}
    >
      Tokens are for cost-sharing: they help cover food, drinks, reservations,
      materials, and similar shared expenses. They are not meant for the host to
      profit. They also help ensure commitment and reduce no-shows.
    </p>
  );
}
