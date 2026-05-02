import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Terms of Service — Vouch",
  description:
    "The rules for using Vouch as a candidate or an employer.",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="2026-05-02">
      <p>
        Welcome to Vouch. These Terms of Service are the agreement between you
        and Vouch (operated by JSM Consulting). By creating an account or
        using the platform, you agree to these terms. If you do not agree,
        please do not use Vouch.
      </p>

      <h2>1. Eligibility</h2>
      <p>
        You must be at least 18 years old and able to enter into a binding
        contract under the laws of your country. If you are signing up on
        behalf of a company, you confirm you have authority to bind that
        company.
      </p>

      <h2>2. What Vouch is — and isn't</h2>
      <p>
        Vouch is an information platform. We help candidates verify their
        identity and credentials, and we help employers discover
        pre-verified candidates. We are <strong>not</strong> a staffing
        agency, an employer of record, or a recruiting firm. We do not make
        hiring decisions, employment offers, or guarantee any outcome.
      </p>
      <p>
        Verification on Vouch confirms specific facts (identity, employment
        history, credentials) at the time the check was run. It is not a
        warranty that a candidate is qualified for any particular role.
      </p>

      <h2>3. Account responsibility</h2>
      <ul>
        <li>You are responsible for keeping your password safe.</li>
        <li>
          You are responsible for everything that happens under your account.
        </li>
        <li>
          Tell us immediately at{" "}
          <a href="mailto:hello@knomadic.io">hello@knomadic.io</a> if you
          suspect unauthorized access.
        </li>
      </ul>

      <h2>4. Accuracy and anti-fraud</h2>
      <p>
        The whole point of Vouch is trust. So:
      </p>
      <ul>
        <li>Everything you submit must be true and current.</li>
        <li>
          Submitting fake credentials, fake employment history, fake
          references, or impersonating someone else will get your account
          banned permanently and may be reported to law enforcement.
        </li>
        <li>
          References ("vouches") submitted on your behalf must be from real
          people who actually worked with you. Coordinating fake vouches is a
          permanent ban.
        </li>
        <li>
          If we detect fraud, we may revoke your Vouch Score, hide you from
          the marketplace, and notify employers who contacted you.
        </li>
      </ul>

      <h2>5. Payments</h2>
      <p>
        Some Vouch features (verification fees, employer subscriptions) cost
        money. Payments are processed by Stripe, subject to Stripe's terms.
        Subscriptions auto-renew until cancelled. Refunds are at our
        discretion and described on the relevant pricing page.
      </p>

      <h2>6. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Scrape, copy, or republish candidate profiles in bulk.</li>
        <li>
          Use the marketplace to discriminate on the basis of race, religion,
          gender, age, disability, sexual orientation, national origin, or
          any other protected class.
        </li>
        <li>Send spam, harass other users, or use Vouch to phish.</li>
        <li>
          Attempt to break, reverse-engineer, or attack the platform or
          probe its security without our written permission.
        </li>
        <li>Misrepresent your role (candidate vs. employer vs. agency).</li>
        <li>
          Use Vouch data to train external models, build a competing
          marketplace, or resell verification information.
        </li>
      </ul>

      <h2>7. Content you submit</h2>
      <p>
        You keep ownership of the content you put on Vouch — your resume,
        profile, photos, vouches you write. By submitting it, you give us a
        worldwide, royalty-free license to host, display, and process it for
        the purpose of running the platform. Employers you opt to share with
        get a license to view it for the purpose of considering you for
        roles. That license ends when you delete the content or your account.
      </p>

      <h2>8. Termination</h2>
      <p>
        You can close your account at any time from{" "}
        <a href="/dashboard/settings">your settings</a>. We can suspend or
        terminate accounts that violate these terms or that we reasonably
        believe pose a risk to other users. We will give notice and a chance
        to respond except in cases of fraud, abuse, or legal requirement.
      </p>

      <h2>9. No warranties</h2>
      <p>
        Vouch is provided "as is". We do not promise the platform will be
        uninterrupted, error-free, or that any specific candidate or
        employer connection will result in a job, offer, or hire.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        To the maximum extent allowed by law, Vouch and its operators are
        not liable for indirect, incidental, special, or consequential
        damages, lost profits, or loss of data arising from your use of the
        platform. Our total aggregate liability to you for any claim is
        limited to the greater of $100 or the amount you paid us in the 12
        months before the claim.
      </p>

      <h2>11. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless Vouch from any claim, loss,
        or expense (including reasonable attorney's fees) arising out of
        your breach of these terms, your content, or your misuse of the
        platform.
      </p>

      <h2>12. Governing law</h2>
      <p>
        These terms are governed by the laws of the State of Delaware, USA,
        without regard to conflict-of-law rules. Disputes will be resolved
        in the state or federal courts located in Delaware, and you consent
        to that jurisdiction. (Founder note: this is a placeholder pending
        legal review — Vouch's eventual incorporation jurisdiction may
        change this.)
      </p>

      <h2>13. Changes</h2>
      <p>
        We may update these terms when our service or laws change. Material
        changes will be notified by email and on this page. Continued use
        after the change means you accept the updated terms.
      </p>

      <h2>14. Contact</h2>
      <p>
        Questions about these terms:{" "}
        <a href="mailto:hello@knomadic.io">hello@knomadic.io</a>.
      </p>
    </LegalLayout>
  );
}
