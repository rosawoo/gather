import Link from "next/link";

export function PrivacyDocument() {
  return (
    <article className="terms-card terms-doc-body">
      <h1 className="terms-doc-title landing-font-display lowercase">
        gather privacy policy
      </h1>
      <p className="terms-doc-updated">
        effective date: january 20, 2026
        <br />
        last updated: january 20, 2026
      </p>

      <p>
        this privacy policy explains how gather (&ldquo;gather,&rdquo;
        &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects,
        uses, and shares information about you when you use our website, mobile
        application, and related services (collectively, the
        &ldquo;platform&rdquo;), or when you communicate with us. we are based in
        the united states.
      </p>
      <p>
        this privacy policy does not cover how other users (including hosts and
        attendees) may use information you choose to share with them. please use
        care when sharing personal information.
      </p>

      <h2 className="terms-section-heading">1. information we collect</h2>

      <h3 className="terms-subheading">1.1 information you provide</h3>
      <p>we collect information you provide directly to us, including when you:</p>
      <ul className="terms-list">
        <li>create an account or subscribe to use the platform</li>
        <li>complete your profile</li>
        <li>host a gathering or request to join one</li>
        <li>message other users</li>
        <li>contact us for support</li>
      </ul>
      <p>the information you provide may include:</p>
      <p>
        <strong>account and profile information:</strong> name (or first name),
        email address, password, profile details you choose to provide (for
        example, interests or a short bio), photos you upload to your profile
        (if you choose to).
      </p>
      <p>
        <strong>address information (hosts):</strong> if you host a gathering, we
        collect the gathering&rsquo;s actual street address because it is required
        to hold the event and to share location details with approved attendees.
      </p>
      <p>
        <strong>payments and subscription information:</strong> information about
        your subscription status and purchase history (such as plan type, token
        purchases, and transaction timestamps); billing information necessary to
        process payment (handled through our payment processor).
      </p>

      <h3 className="terms-subheading">1.2 information we collect automatically</h3>
      <p>
        when you use the platform, we collect certain information automatically,
        including:
      </p>
      <ul className="terms-list">
        <li>
          usage data, such as features used, pages or screens viewed, actions
          taken, and timestamps
        </li>
        <li>
          log data, such as ip address, browser type, and access times
        </li>
        <li>
          device data, such as device type, operating system version, and device
          identifiers
        </li>
      </ul>

      <h3 className="terms-subheading">1.3 cookies and similar technologies</h3>
      <p>we use cookies and similar technologies to:</p>
      <ul className="terms-list">
        <li>keep you logged in</li>
        <li>remember preferences</li>
        <li>operate and secure the platform</li>
        <li>understand usage and improve performance</li>
      </ul>
      <p>
        you can control cookies through your browser settings. some parts of
        the platform may not function properly if cookies are disabled.
      </p>

      <h2 className="terms-section-heading">2. how we use information</h2>

      <h3 className="terms-subheading">2.1 provide and operate the platform</h3>
      <p>we use information to:</p>
      <ul className="terms-list">
        <li>create and manage accounts</li>
        <li>
          provide paid access to the platform, including verifying subscription
          status
        </li>
        <li>enable hosting, discovery, and attendance requests</li>
        <li>facilitate messaging between users</li>
        <li>provide customer support</li>
      </ul>

      <h3 className="terms-subheading">2.2 process payments</h3>
      <p>we use information to:</p>
      <ul className="terms-list">
        <li>
          process subscriptions, tokens, and other paid features through our
          payment processor
        </li>
        <li>
          maintain records of transactions for accounting and customer support
        </li>
      </ul>

      <h3 className="terms-subheading">2.3 safety, integrity, and enforcement</h3>
      <p>we use information to:</p>
      <ul className="terms-list">
        <li>help prevent fraud, abuse, and unauthorized access</li>
        <li>
          investigate reports and enforce our{" "}
          <Link href="/terms-of-service">terms of service</Link>
        </li>
        <li>protect the rights, safety, and property of gather, users, and others</li>
      </ul>

      <h3 className="terms-subheading">2.4 communications</h3>
      <p>we use information to:</p>
      <ul className="terms-list">
        <li>
          send service-related communications, such as receipts, confirmations,
          security notices, and policy updates
        </li>
        <li>
          send marketing communications where permitted by law (you can opt out)
        </li>
      </ul>

      <h2 className="terms-section-heading">3. how we share information</h2>

      <h3 className="terms-subheading">3.1 sharing with other users</h3>
      <p>
        the platform is designed to help users host and attend gatherings, so
        some information is shared with others.
      </p>
      <p>information that may be shared includes:</p>
      <ul className="terms-list">
        <li>
          profile information displayed on the platform, such as first name,
          photos if you upload them, and bio or interests
        </li>
        <li>
          information related to gatherings, such as that you requested to join
          or are attending
        </li>
      </ul>
      <p>
        <strong>host addresses:</strong> a host&rsquo;s actual address is not
        displayed publicly. a host&rsquo;s address is shared only with approved
        attendees as needed to attend the gathering, and may be shared closer to
        the event time.
      </p>

      <h3 className="terms-subheading">3.2 service providers</h3>
      <p>
        we share information with vendors that help us operate the platform, such
        as:
      </p>
      <ul className="terms-list">
        <li>hosting and data storage providers</li>
        <li>customer support tools</li>
        <li>email or messaging providers</li>
        <li>payment processors</li>
      </ul>
      <p>
        these vendors are required to protect the information and use it only to
        provide services to us.
      </p>

      <h3 className="terms-subheading">3.3 payment processing</h3>
      <p>
        payments are processed through third-party payment processors. we share
        information as needed to complete transactions and prevent fraud. we
        receive limited information in return, such as payment confirmation,
        transaction ids, and subscription status. we do not store full payment
        card numbers unless explicitly stated at checkout.
      </p>

      <h3 className="terms-subheading">3.4 legal requirements and protection</h3>
      <p>we may disclose information if we believe it is necessary to:</p>
      <ul className="terms-list">
        <li>comply with applicable law or legal process</li>
        <li>respond to lawful requests from authorities</li>
        <li>
          protect the rights, safety, and property of gather, our users, or others
        </li>
        <li>
          enforce our <Link href="/terms-of-service">terms of service</Link>
        </li>
      </ul>

      <h3 className="terms-subheading">3.5 business transfers</h3>
      <p>
        if gather is involved in a merger, acquisition, financing,
        reorganization, bankruptcy, or sale of assets, information may be
        transferred as part of that transaction, consistent with law.
      </p>

      <h2 className="terms-section-heading">4. data retention and security</h2>

      <h3 className="terms-subheading">4.1 data retention</h3>
      <p>we retain information for as long as reasonably necessary to:</p>
      <ul className="terms-list">
        <li>provide the platform and maintain your account</li>
        <li>process payments and maintain transaction records</li>
        <li>
          enforce our <Link href="/terms-of-service">terms of service</Link> and
          resolve disputes
        </li>
        <li>comply with legal, tax, and accounting requirements</li>
      </ul>
      <p>
        if you request deletion of your account, we will delete or de-identify
        information where feasible, but may retain certain information as
        required or permitted by law.
      </p>

      <h3 className="terms-subheading">4.2 security</h3>
      <p>
        we use safeguards designed to protect your information. however, no method
        of transmission over the internet or method of storage is completely
        secure. you are responsible for keeping your password confidential.
      </p>

      <h2 className="terms-section-heading">5. your choices</h2>
      <p>you may:</p>
      <ul className="terms-list">
        <li>update certain account and profile information through your settings</li>
        <li>
          opt out of marketing emails using the unsubscribe link (you will still
          receive essential service communications)
        </li>
        <li>
          manage cookie settings in your browser, noting that disabling cookies
          may affect functionality
        </li>
      </ul>

      <h2 className="terms-section-heading">6. your rights</h2>
      <p>
        depending on where you live, you may have rights to request access to,
        correction of, or deletion of your personal information.
      </p>
      <p>
        to make a privacy request, contact us at{" "}
        <a href="mailto:team@gathersocial.us">team@gathersocial.us</a> using the
        email associated with your account. we may need to verify your identity.
      </p>

      <h2 className="terms-section-heading">7. changes to this policy</h2>
      <p>
        we may update this privacy policy from time to time. we will post the
        updated version and revise the &ldquo;last updated&rdquo; date.
      </p>

      <p className="mt-10">
        for questions or requests about privacy, contact:{" "}
        <a href="mailto:gathersocial.us@gmail.com">gathersocial.us@gmail.com</a>
      </p>
    </article>
  );
}
