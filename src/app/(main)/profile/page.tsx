import { auth } from "@/auth";
import { TokenExplainer } from "@/components/token-explainer";
import { prisma } from "@/lib/prisma";
import { PERSONALITY_PROMPTS } from "@/lib/prompts";
import { ageFromDob } from "@/lib/gathering-display";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth();
  const userId = session!.user!.id;

  const u = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      profile: true,
      photos: { orderBy: { sortOrder: "asc" } },
      promptAnswers: true,
    },
  });

  const primary = u.photos.find((p) => p.isPrimary) ?? u.photos[0];
  const p = u.profile!;

  return (
    <div className="px-4 pb-28">
      <h1 className="text-xl font-semibold">Profile</h1>

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
        <p className="mt-4 text-2xl font-semibold">{p.firstName}</p>
        <p className="text-sm text-neutral-500">{ageFromDob(p.dateOfBirth)}</p>
      </div>

      <div className="mt-6 space-y-1 text-center text-sm text-neutral-700">
        {p.neighborhood ? <p>{p.neighborhood}</p> : null}
        {p.college ? <p>{p.college}</p> : null}
        {p.job ? <p>{p.job}</p> : null}
      </div>

      <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-neutral-700">
        {p.bio}
      </p>

      <div className="mx-auto mt-8 max-w-md space-y-4">
        {PERSONALITY_PROMPTS.map((pr) => {
          const ans = u.promptAnswers.find((a) => a.promptKey === pr.key);
          if (!ans) return null;
          return (
            <div key={pr.key}>
              <p className="text-xs font-medium text-gather-brown-mid">
                {pr.label}
              </p>
              <p className="mt-1 text-sm text-neutral-800">{ans.body}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-xl border border-neutral-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase text-neutral-500">
          Token wallet
        </p>
        <p className="mt-2 text-sm">
          Available: <strong>{u.tokensAvailable}</strong> · Held:{" "}
          <strong>{u.tokensHeld}</strong>
        </p>
        <TokenExplainer className="mt-2" />
        <Link
          href="/profile/tokens"
          className="mt-4 inline-block rounded-full bg-gather-brown px-4 py-2 text-sm font-medium text-gather-cream"
        >
          Buy tokens
        </Link>
      </div>

      <p className="mt-4 text-sm text-neutral-600">
        Plan: <strong>{u.plan}</strong>
      </p>

      <ul className="mt-8 space-y-3 text-sm">
        <li>
          <Link href="/profile/edit" className="text-gather-brown hover:underline">
            Edit profile
          </Link>
        </li>
        <li>
          <Link href="/profile/notifications" className="text-gather-brown hover:underline">
            Notifications
          </Link>
        </li>
        <li>
          <Link href="/profile/settings" className="text-gather-brown hover:underline">
            Settings
          </Link>
        </li>
      </ul>
    </div>
  );
}
