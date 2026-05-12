import { auth } from "@/auth";
import { PolaroidCard } from "@/components/polaroid-card";
import { prisma } from "@/lib/prisma";
import { GatheringStatus, GatheringType, Plan } from "@prisma/client";
import { DiscoverFilters } from "@/components/discover-filters";
import { getUsedNeighborhoods } from "@/lib/neighborhoods";

type SearchParams = {
  q?: string;
  neighborhood?: string;
  type?: string;
  size?: string;
  cost?: string;
  date?: string;
};

function parseSize(v?: string): { min?: number; max?: number } | null {
  switch (v) {
    case "xs":
      return { max: 4 };
    case "sm":
      return { min: 5, max: 7 };
    case "md":
      return { min: 8, max: 12 };
    case "lg":
      return { min: 13 };
    default:
      return null;
  }
}

function parseDate(v?: string): { gte: Date; lte?: Date } | null {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  switch (v) {
    case "today": {
      const end = new Date(startOfToday);
      end.setDate(end.getDate() + 1);
      return { gte: startOfToday, lte: end };
    }
    case "week": {
      const end = new Date(startOfToday);
      end.setDate(end.getDate() + 7);
      return { gte: now, lte: end };
    }
    case "month": {
      const end = new Date(startOfToday);
      end.setMonth(end.getMonth() + 1);
      return { gte: now, lte: end };
    }
    default:
      return null;
  }
}

export default async function DiscoverGatheringsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session!.user!.id },
  });

  const sp = await searchParams;
  const neighborhoods = await getUsedNeighborhoods();

  const dateRange = parseDate(sp.date);
  const size = parseSize(sp.size);

  const typeValid =
    sp.type === "HOME" || sp.type === "PUBLIC" || sp.type === "OTHER";

  const tokenFilter: number | { gte?: number; lte?: number } | undefined = (() => {
    switch (sp.cost) {
      case "free":
        return 0;
      case "1":
        return 1;
      case "2":
        return 2;
      case "3+":
        return { gte: 3 };
      default:
        return undefined;
    }
  })();

  const rows = await prisma.gathering.findMany({
    where: {
      status: GatheringStatus.PUBLISHED,
      startsAt: dateRange
        ? { ...dateRange, gt: new Date() }
        : { gt: new Date() },
      ...(sp.neighborhood ? { neighborhood: sp.neighborhood } : {}),
      ...(typeValid ? { gatheringType: sp.type as GatheringType } : {}),
      ...(sp.q
        ? {
            OR: [
              { title: { contains: sp.q } },
              { description: { contains: sp.q } },
            ],
          }
        : {}),
      ...(size?.min ? { maxTotalSize: { gte: size.min } } : {}),
      ...(size?.max ? { minTotalSize: { lte: size.max } } : {}),
      ...(tokenFilter !== undefined ? { tokenCost: tokenFilter } : {}),
    },
    orderBy: { startsAt: "asc" },
    include: {
      host: {
        include: {
          profile: true,
          photos: { where: { isPrimary: true }, take: 1 },
        },
      },
    },
  });

  const visible = rows.filter((g) => {
    if (user.plan === Plan.OBSERVER && g.tokenCost >= 2) return false;
    return true;
  });

  const hasActiveFilters =
    !!(sp.q || sp.neighborhood || sp.type || sp.size || sp.cost || sp.date);

  return (
    <div className="relative pb-10" dir="ltr">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-72 max-w-3xl bg-[radial-gradient(ellipse_at_50%_0%,rgba(250,246,242,0.95)_0%,transparent_55%)] blur-xl"
      />

      <DiscoverFilters neighborhoods={neighborhoods} />

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/60 px-5 py-10 text-center">
          <p className="text-sm font-semibold text-gather-ink">
            {hasActiveFilters ? "No gatherings match" : "Nothing open right now"}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            {hasActiveFilters
              ? "Try loosening your filters."
              : "New gatherings drop regularly. Or host one from the Host tab."}
          </p>
        </div>
      ) : (
        <div className="-mx-4 flex snap-x snap-mandatory gap-10 overflow-x-auto px-5 pb-6 pt-2 [scrollbar-width:thin] sm:mx-0 sm:flex-wrap sm:justify-start sm:gap-x-12 sm:gap-y-16 sm:overflow-visible sm:px-0 sm:pb-2">
          {visible.map((g, i) => (
            <div key={g.id} className="shrink-0 snap-center sm:shrink">
              <PolaroidCard
                scrapbookIndex={i}
                id={g.id}
                title={g.title}
                coverImageUrl={g.coverImageUrl}
                startsAt={g.startsAt}
                neighborhood={g.neighborhood}
                minTotalSize={g.minTotalSize}
                maxTotalSize={g.maxTotalSize}
                hostFriendsCount={g.hostFriendsCount}
                tokenCost={g.tokenCost}
                hostImage={g.host.photos[0]?.url ?? g.host.image}
                hostId={g.hostId}
                hostFirstName={g.host.profile?.firstName ?? null}
                hostDateOfBirth={g.host.profile?.dateOfBirth ?? null}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
