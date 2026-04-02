import { auth } from "@/auth";
import { PolaroidCard } from "@/components/polaroid-card";
import { prisma } from "@/lib/prisma";
import { GatheringStatus, Plan } from "@prisma/client";

export default async function DiscoverGatheringsPage() {
  const session = await auth();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session!.user!.id },
  });

  const rows = await prisma.gathering.findMany({
    where: {
      status: GatheringStatus.PUBLISHED,
      startsAt: { gt: new Date() },
    },
    orderBy: { startsAt: "asc" },
    include: {
      host: {
        include: {
          photos: { where: { isPrimary: true }, take: 1 },
        },
      },
    },
  });

  const visible = rows.filter((g) => {
    if (user.plan === Plan.OBSERVER && g.tokenCost >= 2) return false;
    return true;
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gather-ink">Discover</h1>
      {visible.length === 0 ? (
        <p className="text-sm text-neutral-600">
          No gatherings yet. Check back soon — or host one from the Host tab.
        </p>
      ) : (
        <div className="flex flex-col items-center gap-10 pb-8">
          {visible.map((g) => (
            <PolaroidCard
              key={g.id}
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
