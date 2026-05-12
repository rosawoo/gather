import Link from "next/link";

export function AboutContent() {
  return (
    <article className="about-manifesto-card landing-candlelit lowercase">
      <section className="about-manifesto-section">
        <h2 className="about-manifesto-heading">how it works:</h2>
        <ol className="about-manifesto-body about-manifesto-ol">
          <li>create a profile so hosts know who you are.</li>
          <li>
            find or host a gathering, solo or with people you already trust.
          </li>
          <li>request to join; hosts approve who fits the room.</li>
          <li>
            use tokens where it helps cover food, drinks, or space, always
            disclosed up front.
          </li>
          <li>show up, share a table, and see how it feels.</li>
        </ol>
      </section>

      <section className="about-manifesto-section">
        <h2 className="about-manifesto-heading">who gather is for:</h2>
        <ul className="about-manifesto-body about-manifesto-ul">
          <li>
            aspiring dinner-party hosts who want their living room full, not
            their inbox.
          </li>
          <li>
            board-game regulars who need one or two more seats at the table.
          </li>
          <li>
            fans who want a living-room watch party, not a shouting sports bar.
          </li>
          <li>
            guests &amp; hosts, couples &amp; singles, new in town or on their
            fourth roommate.
          </li>
          <li>
            anyone who wants to socialize on their own terms, and treat new
            friends like old ones.
          </li>
        </ul>
      </section>

      <div className="about-manifesto-section about-manifesto-body">
        <p className="text-[#e8ddd2]/95">
          gather is a quiet corner of the internet built for real rooms: warm
          light, honest introductions, and tables that do not scroll.
        </p>
      </div>

      <div className="about-manifesto-join-wrap">
        <Link
          href={`/?callbackUrl=${encodeURIComponent("/gatherings")}`}
          className="about-manifesto-join"
        >
          join us
        </Link>
        <p className="about-manifesto-join-sub">
          <Link
            href={`/sign-in?callbackUrl=${encodeURIComponent("/gatherings")}`}
          >
            sign in
          </Link>
          <span className="text-[#a98974]/85"> if you already have a seat.</span>
        </p>
      </div>
    </article>
  );
}
