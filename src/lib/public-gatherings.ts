import { prisma } from "@/lib/prisma";
import { GatheringStatus } from "@prisma/client";

export type GatheringTeaser = {
  id: string;
  title: string;
  neighborhood: string;
  startsAt: Date;
  tokenCost: number;
};

/**
 * Published, upcoming gatherings for the marketing home (no auth).
 */
export async function getPublicGatheringTeasers(
  limit: number,
): Promise<GatheringTeaser[]> {
  const rows = await prisma.gathering.findMany({
    where: {
      status: GatheringStatus.PUBLISHED,
      startsAt: { gt: new Date() },
    },
    orderBy: { startsAt: "asc" },
    take: limit,
    select: {
      id: true,
      title: true,
      neighborhood: true,
      startsAt: true,
      tokenCost: true,
    },
  });
  return rows;
}
