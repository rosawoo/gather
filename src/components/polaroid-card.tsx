import Link from "next/link";
import { capacityLine, ageFromDob } from "@/lib/gathering-display";
import { CoverArt } from "@/components/cover-art";

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
  hostId: string;
  hostFirstName: string | null;
  hostDateOfBirth: Date | null;
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

  const hostLabel = props.hostFirstName?.trim() || "Host";
  const hostAge =
    props.hostDateOfBirth != null
      ? ageFromDob(props.hostDateOfBirth)
      : null;

  return (
    <div className="w-[min(100%,280px)] rotate-[-1.2deg] transition duration-300 hover:rotate-0 hover:scale-[1.02]">
      <div className="rounded-xl bg-white p-3 pb-14 shadow-lg shadow-black/10 ring-1 ring-black/[0.07] transition duration-300 hover:shadow-xl hover:ring-gather-accent/25">
        <Link href={`/gatherings/${props.id}`} className="group block">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-neutral-200">
            <CoverArt cover={props.coverImageUrl} title={props.title} />
            <span className="absolute bottom-2 right-2 inline-flex rounded-full bg-gather-cream/95 px-2.5 py-0.5 text-[11px] font-semibold text-gather-brown shadow-sm ring-1 ring-black/5">
              {tokenLabel}
            </span>
          </div>
          <div className="mt-3 space-y-1.5 px-0.5">
            <h3 className="font-handwriting line-clamp-2 text-[17px] font-medium leading-snug text-gather-ink transition-colors group-hover:text-gather-brown-mid">
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
          </div>
        </Link>
        <div className="mt-2.5 border-t border-neutral-100 pt-2.5">
          <Link
            href={`/u/${props.hostId}`}
            className="flex items-center gap-2 rounded-lg px-0.5 py-1 transition hover:bg-gather-paper/80"
          >
            {props.hostImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={props.hostImage}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-neutral-300 ring-2 ring-white" />
            )}
            <span className="text-xs font-medium text-neutral-700">
              {hostLabel}
              {hostAge != null ? (
                <span className="font-normal text-neutral-500"> · {hostAge}</span>
              ) : null}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
