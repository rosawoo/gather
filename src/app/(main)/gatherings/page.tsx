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
    <div className="pb-8">
      <p className="mb-8 text-sm text-neutral-600">
        Small gatherings open for requests this week.
      </p>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/60 px-5 py-10 text-center">
          <p className="text-sm font-semibold text-gather-ink">
            Nothing open right now
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            New gatherings drop regularly. Or host one from the Host tab.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-10">
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
