import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GatheringStatus, GatheringType, Plan, GatheringRequestStatus } from "@prisma/client";
import { DiscoverExperience } from "@/components/discover-experience";
import { getNeighborhoodFilterList } from "@/lib/neighborhoods";

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
  const neighborhoods = await getNeighborhoodFilterList();

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
      requests: {
        where: {
          status: {
            in: [
              GatheringRequestStatus.PENDING,
              GatheringRequestStatus.APPROVED,
            ],
          },
        },
        select: { id: true },
      },
    },
  });

  const visible = rows.filter((g) => {
    if (user.plan === Plan.OBSERVER && g.tokenCost >= 2) return false;
    return true;
  });

  const hasActiveFilters =
    !!(sp.q || sp.neighborhood || sp.type || sp.size || sp.cost || sp.date);

  const items = visible.map((g) => {
    const filled = g.hostFriendsCount + g.requests.length;
    const spotsLeft = Math.max(0, g.maxTotalSize - filled);
    return {
      id: g.id,
      title: g.title,
      description: g.description,
      coverImageUrl: g.coverImageUrl,
      startsAt: g.startsAt.toISOString(),
      neighborhood: g.neighborhood,
      gatheringType: g.gatheringType,
      minTotalSize: g.minTotalSize,
      maxTotalSize: g.maxTotalSize,
      hostFriendsCount: g.hostFriendsCount,
      tokenCost: g.tokenCost,
      hostImage: g.host.photos[0]?.url ?? g.host.image,
      hostId: g.hostId,
      hostFirstName: g.host.profile?.firstName ?? null,
      hostDateOfBirth: g.host.profile?.dateOfBirth?.toISOString() ?? null,
      spotsLeft,
    };
  });

  return (
    <div className="relative pb-10" dir="ltr">
      <DiscoverExperience
        neighborhoods={neighborhoods}
        items={items}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  );
}
