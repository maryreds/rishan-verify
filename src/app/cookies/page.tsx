import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Cookie Policy — Vouch",
  description:
    "What cookies Vouch uses, why, and how you can control them.",
};

export default function CookiesPage() {
  return (
    <LegalLayout title="Cookie Policy" lastUpdated="2026-05-02">
      <p>
        This page explains the cookies and similar technologies Vouch uses.
        We try to keep cookies to a strict minimum — only what is needed to
        keep you signed in and the platform secure.
      </p>

      <h2>1. What is a cookie?</h2>
      <p>
        A cookie is a small text file a website stores on your browser to
        remember things between page loads. Cookies are how staying signed in
        works.
      </p>

      <h2>2. Cookies we use today</h2>
      <h3>Essential — authentication</h3>
      <p>
        Vouch uses Supabase Auth, which sets a small number of cookies in
        your browser to keep you signed in and to keep your session secure.
        These cookies are strictly necessary — without them, you cannot log
        in. They expire when you sign out or after a short period of
        inactivity.
      </p>
      <h3>Essential — security</h3>
      <p>
        We may set short-lived cookies to defend against cross-site request
        forgery (CSRF) and to rate-limit suspicious traffic. These are also
        strictly necessary.
      </p>

      <h2>3. Cookies we do not use</h2>
      <ul>
        <li>
          <strong>No advertising cookies.</strong> We do not run ads. We do
          not let third-party advertisers track you on Vouch.
        </li>
        <li>
          <strong>No analytics today.</strong> At launch we are not running
          analytics services like Google Analytics, Mixpanel, or
          Segment. We may add a privacy-friendly analytics tool in the
          future. If we do, we will update this page first and explain
          exactly what it tracks.
        </li>
        <li>
          <strong>No social-media tracking pixels.</strong> No Meta pixel, no
          LinkedIn Insight Tag, no TikTok pixel.
        </li>
      </ul>

      <h2>4. Your choices</h2>
      <p>
        Because the only cookies we set are strictly necessary, there is no
        consent banner asking you to opt out — strictly necessary cookies
        do not require consent under GDPR or the ePrivacy Directive. If we
        ever add non-essential cookies (for example, analytics), we will
        show you a clear consent banner before any of those cookies are
        set, and you will be able to refuse without losing access to the
        site.
      </p>
      <p>
        You can also clear cookies in your browser at any time. Note that
        if you clear our authentication cookie, you will be signed out and
        will need to log in again.
      </p>

      <h2>5. Third parties</h2>
      <p>
        Some of our verification flows redirect you to third parties, such
        as Persona for ID verification or Stripe for payments. Those
        services set their own cookies on their own domains, governed by
        their own cookie policies. We do not have control over those
        cookies.
      </p>

      <h2>6. Changes</h2>
      <p>
        We will update this page if we add or remove cookies. The "Last
        updated" date at the top will reflect the change.
      </p>

      <h2>7. Contact</h2>
      <p>
        Questions about this policy:{" "}
        <a href="mailto:hello@knomadic.io">hello@knomadic.io</a>.
      </p>
    </LegalLayout>
  );
}
