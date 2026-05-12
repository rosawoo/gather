import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { nextAppPath } from "@/lib/onboarding";
import Link from "next/link";
import { redirect } from "next/navigation";

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
    <div className="min-h-full bg-gather-cream text-gather-ink">
      <div className="mx-auto max-w-lg px-6 pb-20 pt-[calc(env(safe-area-inset-top,0px)+2rem)] sm:px-8">
        <header className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-gather-teal">
            gather{" "}
            <span className="text-gather-charcoal/50" aria-hidden>
              |
            </span>{" "}
            find local gatherings
          </p>
          <h1 className="mt-10 font-handwriting text-[2.35rem] font-normal leading-[1.2] sm:text-[2.75rem]">
            treat new friends like old ones.
          </h1>
          <p className="mt-4 text-sm font-normal leading-relaxed text-gather-charcoal">
            Coming to Washington, D.C. Host-led gatherings, real rooms, no
            awkward Venmo moments. Small groups you actually want to be in.
          </p>
        </header>

        <div className="mt-10 space-y-3 border border-gather-teal bg-white/35 p-5 shadow-sm">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-gather-teal">
            Get started
          </p>
          <Link
            href="/sign-up"
            className="block w-full border border-gather-teal bg-gather-wine py-3.5 text-center text-sm font-semibold text-gather-cream transition hover:bg-gather-charcoal"
          >
            Create account
          </Link>
          <Link
            href="/sign-in"
            className="block w-full border border-gather-teal bg-transparent py-3.5 text-center text-sm font-semibold text-gather-teal transition hover:bg-gather-teal/10"
          >
            Log in
          </Link>
        </div>

        <section className="mt-16 border-b-2 border-gather-teal pb-2">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-gather-teal">
            How you gather
          </p>
          <h2 className="mt-3 font-display text-xl font-bold leading-snug sm:text-2xl">
            we want you to meet people gathering
          </h2>
        </section>

        <div className="mt-6 border border-gather-teal bg-white/30 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gather-charcoal">
            Think
          </p>
          <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-gather-ink">
            <li className="flex gap-2">
              <span className="text-gather-teal" aria-hidden>
                &#8226;
              </span>
              <span>Catan, red wine, and Trader Joe&apos;s snacks</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gather-teal" aria-hidden>
                &#8226;
              </span>
              <span>A doubles tennis crew in need of a fourth</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gather-teal" aria-hidden>
                &#8226;
              </span>
              <span>Bachelorette, candy, and pajamas</span>
            </li>
          </ul>
          <p className="mt-5 text-sm leading-relaxed text-gather-charcoal">
            Hosts choose who joins. Guests choose what gatherings feel right.
            We&apos;ll handle the rest.
          </p>
          <p className="mt-3 text-sm italic leading-relaxed text-gather-charcoal/90">
            No awkward Venmo moments, no &quot;should I be here?&quot;, just
            more real gatherings.
          </p>
        </div>

        <div className="mt-12 flex flex-col items-center gap-8 sm:flex-row sm:justify-center sm:gap-6">
          <PolaroidStub
            title="dinner at emily's"
            subtitle="logan circle, 1.12"
          />
          <PolaroidStub title="game night!" subtitle="navy yard, 1.28" />
        </div>

        <p className="mt-14 text-center text-xs text-gather-charcoal/80">
          Free to join during beta.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 border-t border-gather-line pt-8">
          <a
            href="https://www.gathersocial.us/about"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold uppercase tracking-[0.14em] text-gather-teal underline-offset-4 hover:underline"
          >
            see how it works
          </a>
          <p className="text-center text-[10px] text-gather-charcoal/60">
            More on the Gather story lives on gathersocial.us
          </p>
        </div>
      </div>
    </div>
  );
}

function PolaroidStub({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="w-[min(100%,220px)] -rotate-[1.5deg] shadow-md ring-1 ring-black/10 transition hover:rotate-0 sm:w-[200px]">
      <div className="bg-white p-3 pb-8">
        <div className="aspect-[4/3] w-full bg-gradient-to-br from-gather-peach/40 to-gather-teal/15" />
        <p className="mt-3 font-handwriting text-lg leading-tight text-gather-ink">
          {title}
        </p>
        <p className="mt-1 text-xs font-medium text-gather-teal">{subtitle}</p>
      </div>
    </div>
  );
}
