import { prisma } from "@/lib/prisma";

/** Return distinct neighborhoods from profiles and gatherings. */
export async function getUsedNeighborhoods(): Promise<string[]> {
  const [profiles, gatherings] = await Promise.all([
    prisma.profile.findMany({
      where: { neighborhood: { not: null } },
      select: { neighborhood: true },
      distinct: ["neighborhood"],
    }),
    prisma.gathering.findMany({
      select: { neighborhood: true },
      distinct: ["neighborhood"],
    }),
  ]);

  const set = new Set<string>();
  for (const p of profiles) if (p.neighborhood) set.add(p.neighborhood);
  for (const g of gatherings) set.add(g.neighborhood);
  return Array.from(set).sort();
}
