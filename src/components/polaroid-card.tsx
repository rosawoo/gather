import Link from "next/link";
import { capacityLine } from "@/lib/gathering-display";

type PolaroidCardProps = {
  id: string;
  title: string;
  coverImageUrl: string | null;
  startsAt: Date;
  neighborhood: string;
  minTotalSize: number;
  maxTotalSize: number;
  hostFriendsCount: number;
  tokenCost: number;
  hostImage: string | null;
};

export function PolaroidCard(props: PolaroidCardProps) {
  const dateStr = props.startsAt.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const tokenLabel =
    props.tokenCost === 0
      ? "Free"
      : `${props.tokenCost} token${props.tokenCost === 1 ? "" : "s"}`;

  return (
    <Link
      href={`/gatherings/${props.id}`}
      className="group block w-[min(100%,280px)] rotate-[-1.2deg] transition duration-300 hover:rotate-0 hover:scale-[1.02]"
    >
      <div className="rounded-xl bg-white p-3 pb-14 shadow-lg shadow-black/10 ring-1 ring-black/[0.07] transition duration-300 group-hover:shadow-xl group-hover:ring-gather-accent/25">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-neutral-200">
          {props.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={props.coverImageUrl}
              alt=""
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-neutral-400">
              No cover
            </div>
          )}
          <span className="absolute bottom-2 right-2 inline-flex rounded-full bg-gather-cream/95 px-2.5 py-0.5 text-[11px] font-semibold text-gather-brown shadow-sm ring-1 ring-black/5">
            {tokenLabel}
          </span>
        </div>
        <div className="mt-3 space-y-1.5 px-0.5">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gather-ink group-hover:text-gather-brown transition-colors">
            {props.title}
          </h3>
          <p className="text-xs font-medium text-gather-brown-mid/90">{dateStr}</p>
          <p className="text-xs text-neutral-600">{props.neighborhood}</p>
          <p className="text-xs text-neutral-500">
            {capacityLine(
              props.minTotalSize,
              props.maxTotalSize,
              props.hostFriendsCount,
            )}
          </p>
          <div className="flex items-center gap-2 border-t border-neutral-100 pt-2.5">
            {props.hostImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={props.hostImage}
                alt="Host"
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-neutral-300 ring-2 ring-white" />
            )}
            <span className="text-xs font-medium text-neutral-600">Host</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
