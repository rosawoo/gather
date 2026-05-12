import Link from "next/link";

export function AboutContent() {
  return (
    <article className="terms-card terms-doc-body">
      <h1 className="terms-doc-title landing-font-display lowercase">
        how gather works
      </h1>
      <p className="terms-doc-updated lowercase">
        real-life gatherings, host-led, guest-chosen
      </p>

      <h2 className="terms-section-kicker lowercase">how it works</h2>
      <ol className="my-4 list-decimal space-y-3 pl-6 text-[1.05rem] leading-relaxed marker:text-[#c6d8e3]">
        <li>create a profile so hosts know who you are.</li>
        <li>
          find or host a gathering—solo or with people you already trust.
        </li>
        <li>request to join; hosts approve who fits the room.</li>
        <li>
          use tokens where it helps cover food, drinks, or space—always
          disclosed up front.
        </li>
        <li>show up, share a table, and see how it feels.</li>
      </ol>

      <h2 className="terms-section-kicker lowercase">who gather is for</h2>
      <ul className="terms-list">
        <li>
          aspiring dinner-party hosts who want their living room full—not their
          inbox.
        </li>
        <li>board-game regulars who need one or two more seats at the table.</li>
        <li>
          fans who want a living-room watch party, not a shouting sports bar.
        </li>
        <li>
          guests &amp; hosts, couples &amp; singles, new in town or on their
          fourth roommate.
        </li>
        <li>
          anyone who wants to socialize on their own terms—and treat new friends
          like old ones.
        </li>
      </ul>

      <p className="mt-10 text-center text-[1.05rem] text-[#eee9e1]/88">
        <Link
          href={`/sign-up?callbackUrl=${encodeURIComponent("/gatherings")}`}
          className="text-[#c6d8e3] underline decoration-[#c6d8e3]/40 underline-offset-[5px] transition hover:decoration-[#c6d8e3]"
        >
          join gather
        </Link>
        <span className="text-[#a98974]/90"> or </span>
        <Link
          href={`/sign-in?callbackUrl=${encodeURIComponent("/gatherings")}`}
          className="text-[#c6d8e3] underline decoration-[#c6d8e3]/40 underline-offset-[5px] transition hover:decoration-[#c6d8e3]"
        >
          sign in
        </Link>
      </p>
    </article>
  );
}
