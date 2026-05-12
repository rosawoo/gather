import { auth } from "@/auth";
import { CandlelitPageShell } from "@/components/landing/candlelit-page-shell";
import { LandingWaitlistForm } from "@/components/landing/landing-waitlist-form";
import { prisma } from "@/lib/prisma";
import { nextAppPath } from "@/lib/onboarding";
import Link from "next/link";
import { redirect } from "next/navigation";

const POLAROID_PHOTO_SRC =
  "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });
    if (user) redirect(nextAppPath(user));
  }

  return (
    <CandlelitPageShell>
      <main className="mx-auto mt-10 w-full max-w-6xl flex-1">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8 lg:pt-4">
          <div className="lg:col-span-6 lg:pt-2 xl:col-span-5">
            <h2 className="landing-font-display landing-candlelit-hero-glow text-[2.15rem] font-normal leading-[1.08] tracking-[-0.02em] text-[#f4eee7] sm:text-3xl md:text-[2.75rem]">
              treat new friends like old ones.
            </h2>
            <p className="mt-4 text-lg text-[#f4eee7]/88 sm:text-xl">
              coming soon to d.c.
            </p>
          </div>
          <div className="flex flex-col items-start justify-end lg:col-span-6 lg:items-end xl:col-span-7">
            <p className="mb-3 max-w-[320px] text-[0.95rem] leading-relaxed text-[#eee9e1]/85">
              we&apos;re quietly opening a list for the first hosts and guests.
              leave your email—we&apos;ll write like friends, not a marketing
              robot.
            </p>
            <LandingWaitlistForm />
            <p className="mt-4 text-sm text-[#a98974]">
              already in?{" "}
              <Link
                href="/sign-in"
                className="text-[#f4eee7] underline decoration-[#c6d8e3]/50 underline-offset-4 hover:decoration-[#c6d8e3]"
              >
                log in
              </Link>
            </p>
          </div>
        </div>

        <section className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-12 lg:pt-8">
          <div className="flex justify-center lg:col-span-5 lg:justify-start">
            <figure className="landing-polaroid w-full max-w-[300px]">
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#321308]">
                {/* eslint-disable-next-line @next/next/no-img-element -- remote mood photo; avoid coupling to image config */}
                <img
                  src={POLAROID_PHOTO_SRC}
                  alt=""
                  className="h-full w-full object-cover"
                  width={800}
                  height={600}
                />
              </div>
              <figcaption className="mt-3 text-center text-sm italic text-[#3a1a0f]/85">
                same table, softer light
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
            <p>
              <a
                href="https://www.gathersocial.us/about"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#c6d8e3] underline decoration-[#c6d8e3]/40 underline-offset-[5px] transition hover:decoration-[#c6d8e3]"
              >
                see how it works
              </a>{" "}
              <span className="text-[#a98974]/90">on gathersocial.us</span>
            </p>
          </div>
        </section>
      </main>

      <footer className="mx-auto mt-16 w-full max-w-6xl border-t border-[#321308] pt-8 text-center text-xs text-[#a98974]/80">
        free to join during beta.
      </footer>
    </CandlelitPageShell>
  );
}
