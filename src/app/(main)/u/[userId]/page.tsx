import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PERSONALITY_PROMPTS } from "@/lib/prompts";
import { ageFromDob } from "@/lib/gathering-display";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await auth();
  const { userId } = await params;

  const u = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      photos: { orderBy: { sortOrder: "asc" } },
      promptAnswers: true,
    },
  });

  if (!u?.profile) notFound();

  const primary = u.photos.find((p) => p.isPrimary) ?? u.photos[0];

  return (
    <div className="px-4 pb-28">
      <Link href="/gatherings" className="inline-flex items-center gap-1 text-sm text-gather-brown hover:underline">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" /></svg>
        Back
      </Link>
      <div className="mt-6 flex flex-col items-center text-center">
        {primary?.url || u.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primary?.url ?? u.image!}
            alt=""
            className="h-28 w-28 rounded-full object-cover ring-4 ring-white shadow"
          />
        ) : (
          <div className="h-28 w-28 rounded-full bg-neutral-200" />
        )}
        <h1 className="mt-4 text-2xl font-semibold">{u.profile.firstName}</h1>
        <p className="text-sm text-neutral-500">
          {ageFromDob(u.profile.dateOfBirth)}
        </p>
      </div>
      <div className="mt-6 space-y-1 text-center text-sm text-neutral-700">
        {u.profile.neighborhood ? <p>{u.profile.neighborhood}</p> : null}
        {u.profile.college ? <p>{u.profile.college}</p> : null}
        {u.profile.job ? <p>{u.profile.job}</p> : null}
      </div>
      <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-neutral-700">
        {u.profile.bio}
      </p>
      <div className="mx-auto mt-8 max-w-md space-y-4">
        {PERSONALITY_PROMPTS.map((p) => {
          const ans = u.promptAnswers.find((a) => a.promptKey === p.key);
          if (!ans) return null;
          return (
            <div key={p.key}>
              <p className="text-xs font-medium text-gather-brown-mid">
                {p.label}
              </p>
              <p className="mt-1 text-sm text-neutral-800">{ans.body}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {u.photos.map((ph) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={ph.id}
            src={ph.url}
            alt=""
            className="h-24 w-24 rounded-lg object-cover"
          />
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link
          href={`/report?type=user&id=${userId}`}
          className="text-xs text-neutral-500 hover:underline"
        >
          Report profile
        </Link>
      </div>
    </div>
  );
}
