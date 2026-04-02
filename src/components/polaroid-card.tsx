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

  return (
    <Link
      href={`/gatherings/${props.id}`}
      className="block w-[min(100%,280px)] rotate-[-1deg] transition hover:rotate-0 hover:shadow-lg"
    >
      <div className="rounded-sm bg-white p-3 pb-16 shadow-md ring-1 ring-black/5">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-200">
          {props.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={props.coverImageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-neutral-400">
              No cover
            </div>
          )}
        </div>
        <div className="mt-3 space-y-1 px-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gather-ink">
            {props.title}
          </h3>
          <p className="text-xs text-neutral-500">{dateStr}</p>
          <p className="text-xs text-neutral-600">{props.neighborhood}</p>
          <p className="text-xs text-neutral-500">
            {capacityLine(
              props.minTotalSize,
              props.maxTotalSize,
              props.hostFriendsCount,
            )}
          </p>
          <p className="text-xs font-medium text-gather-brown-mid">
            {props.tokenCost === 0
              ? "Free"
              : `${props.tokenCost} token${props.tokenCost === 1 ? "" : "s"}`}
          </p>
          <div className="flex items-center gap-2 pt-1">
            {props.hostImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={props.hostImage}
                alt="Host"
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover ring-2 ring-white"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-neutral-300" />
            )}
            <span className="text-xs text-neutral-500">Host</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
