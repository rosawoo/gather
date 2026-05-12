import { auth } from "@/auth";
import { CandlelitPageShell } from "@/components/landing/candlelit-page-shell";
import { HomeGatheringTeaser } from "@/components/landing/home-gathering-teaser";
import { prisma } from "@/lib/prisma";
import { getPublicGatheringTeasers } from "@/lib/public-gatherings";
import { nextAppPath } from "@/lib/onboarding";
import Link from "next/link";
import { redirect } from "next/navigation";

const POLAROID_PHOTO_SRC =
  "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80";

const SIGN_UP_GATHERINGS = `/sign-up?callbackUrl=${encodeURIComponent("/gatherings")}`;
const SIGN_IN_GATHERINGS = `/sign-in?callbackUrl=${encodeURIComponent("/gatherings")}`;

export default async function LandingPage() {
  const session = await auth();
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });
    if (user) redirect(nextAppPath(user));
  }

  const teaserGatherings = await getPublicGatheringTeasers(4);

  return (
    <CandlelitPageShell>
      <main className="mx-auto mt-10 w-full max-w-6xl flex-1">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8 lg:pt-4">
          <div className="lg:col-span-6 lg:pt-2 xl:col-span-5">
            <h2 className="landing-font-display landing-candlelit-hero-glow text-[2.15rem] font-normal leading-[1.08] tracking-[-0.02em] text-[#f4eee7] sm:text-3xl md:text-[2.75rem]">
              treat new friends like old ones.
            </h2>
            <p className="mt-4 text-lg text-[#f4eee7]/88 sm:text-xl">
              host-led gatherings, in real rooms near you.
            </p>
          </div>
          <div className="flex flex-col items-start justify-end lg:col-span-6 lg:items-end xl:col-span-7">
            <p className="mb-4 max-w-[340px] text-[0.95rem] leading-relaxed text-[#eee9e1]/85">
              discover intimate dinners, game nights, and rooms worth leaving
              the group chat for. create a profile, request a seat, or host your
              own table—we&apos;ll handle the boring parts.
            </p>
            <div className="flex w-full max-w-[320px] flex-col gap-3 sm:flex-row sm:max-w-none sm:gap-4">
              <Link
                href={SIGN_UP_GATHERINGS}
                className="landing-btn-cta inline-flex flex-1 items-center justify-center lowercase no-underline sm:min-w-[160px]"
              >
                join gather
              </Link>
              <Link
                href={SIGN_IN_GATHERINGS}
                className="landing-btn-about inline-flex flex-1 items-center justify-center lowercase no-underline sm:min-w-[140px]"
              >
                sign in
              </Link>
            </div>
            <p className="mt-4 text-sm text-[#a98974]">
              curious how it works?{" "}
              <Link
                href="/about"
                className="text-[#f4eee7] underline decoration-[#c6d8e3]/50 underline-offset-4 hover:decoration-[#c6d8e3]"
              >
                read our story
              </Link>
            </p>
          </div>
        </div>

        <HomeGatheringTeaser gatherings={teaserGatherings} />

        <section className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-12 lg:pt-8">
          <div className="flex justify-center lg:col-span-5 lg:justify-start">
            <figure className="landing-polaroid w-full max-w-[300px]">
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#321308]">
                {/* eslint-disable-next-line @next/next/no-img-element -- mood photo; avoids image remotePatterns */}
                <img
                  src={POLAROID_PHOTO_SRC}
                  alt=""
                  className="h-full w-full object-cover"
                  width={800}
                  height={600}
                />
              </div>
              <figcaption className="mt-3 text-center text-sm italic text-[#3a1a0f]/85">
                your next room is already gathering
              </figcaption>
            </figure>
          </div>
          <div className="space-y-6 text-[1.05rem] leading-relaxed text-[#f4eee7]/90 lg:col-span-7 lg:pt-6">
            <p>we want you to meet people gathering how you gather.</p>
            <div>
              <p className="text-[#a98974]">think</p>
              <ul className="mt-2 space-y-2 pl-0">
                <li className="flex gap-2">
                  <span className="text-[#c6d8e3]" aria-hidden>
                    &#8226;
                  </span>
                  <span>catan, red wine, &amp; trader joe&apos;s snacks</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#c6d8e3]" aria-hidden>
                    &#8226;
                  </span>
                  <span>a doubles tennis crew in need of a fourth</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#c6d8e3]" aria-hidden>
                    &#8226;
                  </span>
                  <span>bachelorette, candy, &amp; pajamas</span>
                </li>
              </ul>
            </div>
            <p className="text-[0.98rem] text-[#eee9e1]/88">
              hosts choose who joins. guests choose what gatherings feel right.
              small rooms, big napkins, low candlelight—somewhere between a
              literary salon and your friend&apos;s living room.
            </p>
          </div>
        </section>
      </main>

      <footer className="mx-auto mt-16 w-full max-w-6xl border-t border-[#321308] pt-8 text-center text-xs leading-relaxed text-[#a98974]/85">
        <p>
          <Link
            href="/about"
            className="text-[#c6d8e3] underline-offset-4 hover:underline"
          >
            about
          </Link>
          <span aria-hidden className="mx-2 text-[#321308]">
            ·
          </span>
          <Link
            href="/terms-of-service"
            className="text-[#c6d8e3] underline-offset-4 hover:underline"
          >
            terms
          </Link>
          <span aria-hidden className="mx-2 text-[#321308]">
            ·
          </span>
          <Link
            href="/privacy-policy"
            className="text-[#c6d8e3] underline-offset-4 hover:underline"
          >
            privacy
          </Link>
          <span aria-hidden className="mx-2 text-[#321308]">
            ·
          </span>
          <Link
            href="/community-guidelines"
            className="text-[#c6d8e3] underline-offset-4 hover:underline"
          >
            community
          </Link>
        </p>
      </footer>
    </CandlelitPageShell>
  );
}
