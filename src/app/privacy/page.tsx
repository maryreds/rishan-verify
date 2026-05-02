import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Privacy Policy — Vouch",
  description:
    "How Vouch collects, uses, stores, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="2026-05-02">
      <p>
        Vouch is a verified candidate marketplace operated by JSM Consulting.
        This Privacy Policy explains what we collect from you, why we collect
        it, who we share it with, and the rights you have over your data. We
        wrote this in plain language because verification only works if you
        trust us.
      </p>

      <h2>1. Who we are</h2>
      <p>
        Vouch ("we", "our", "us") is the controller of the personal data
        described in this policy. You can reach us at{" "}
        <a href="mailto:hello@knomadic.io">hello@knomadic.io</a> with any
        privacy question. (We use a Knomadic email today; Vouch will have its
        own contact address before public launch.)
      </p>

      <h2>2. What we collect</h2>
      <p>We collect only what we need to verify you and connect you with employers:</p>
      <ul>
        <li>
          <strong>Account information</strong> — name, email, password
          (hashed), and the role you signed up as (candidate or employer).
        </li>
        <li>
          <strong>Profile information</strong> — profile photo, headline,
          location, and other details you choose to add.
        </li>
        <li>
          <strong>Resume content</strong> — the resume file you upload and the
          structured data our AI extracts from it (work history, skills,
          education).
        </li>
        <li>
          <strong>Identity verification</strong> — government-issued ID,
          selfie, and address-history documents you provide through our
          identity partner Persona. We receive a verification result and a
          reference ID; we do not store raw images of your ID on our servers.
        </li>
        <li>
          <strong>Payment information</strong> — if you are an employer or
          paid user, Stripe handles your card details. We only store the
          Stripe customer ID and the metadata Stripe returns.
        </li>
        <li>
          <strong>Vouches and references</strong> — text submitted by people
          who vouch for you, plus their name and email.
        </li>
        <li>
          <strong>Usage data</strong> — basic logs (IP address, browser,
          timestamps) needed to keep the service secure.
        </li>
      </ul>

      <h2>3. How we use your data</h2>
      <ul>
        <li>To create and operate your Vouch profile.</li>
        <li>
          To verify your identity, work eligibility, and credentials so
          employers can trust the marketplace.
        </li>
        <li>
          To match you with employers and surface you in employer searches if
          you are a candidate.
        </li>
        <li>To process payments and manage your subscription.</li>
        <li>
          To send transactional email — confirmations, password resets,
          verification status updates.
        </li>
        <li>
          To detect fraud and abuse, including catching fake credentials or
          fake vouches.
        </li>
        <li>To comply with legal obligations.</li>
      </ul>

      <h2>4. Who we share your data with</h2>
      <p>
        We do not sell your data. We do share specific information with the
        service providers we need to run the platform:
      </p>
      <ul>
        <li>
          <strong>Supabase</strong> — our database, auth, and file storage
          provider (US region).
        </li>
        <li>
          <strong>Persona</strong> — for government-ID verification and
          address history checks.
        </li>
        <li>
          <strong>Stripe</strong> — for payment processing.
        </li>
        <li>
          <strong>OpenAI and Anthropic</strong> — to parse resume content and
          power the AI Coach. Resume text is sent to these providers under
          their no-training and zero-retention enterprise terms.
        </li>
        <li>
          <strong>Email delivery</strong> — transactional email service to
          send you account messages.
        </li>
        <li>
          <strong>Verified employers</strong> — once you opt into the
          marketplace, employers can see the parts of your profile you have
          chosen to make visible.
        </li>
      </ul>

      <h2>5. How long we keep your data</h2>
      <p>
        We keep your account data for as long as your account is active. If
        you delete your account, we delete personal data within 30 days,
        except where law requires us to retain certain records (for example,
        tax records for paid customers).
      </p>

      <h2>6. Your rights</h2>
      <p>
        You can ask us at any time to:
      </p>
      <ul>
        <li>Access the data we hold on you.</li>
        <li>Export your data in a portable format.</li>
        <li>Correct anything inaccurate.</li>
        <li>Delete your account and personal data.</li>
        <li>Object to or restrict certain processing.</li>
      </ul>
      <p>
        Email{" "}
        <a href="mailto:hello@knomadic.io">hello@knomadic.io</a> and we will
        respond within 30 days. Residents of California (CCPA) and the EU/UK
        (GDPR) have additional rights described in those laws — we honor them
        regardless of where you live.
      </p>

      <h2>7. Security</h2>
      <p>
        We use TLS in transit, encryption at rest for sensitive fields, and
        role-based access controls. No system is perfectly secure, but we
        treat your verification data with the same care a bank would treat
        your account details.
      </p>

      <h2>8. Children</h2>
      <p>
        Vouch is not for anyone under 18. We do not knowingly collect data
        from minors.
      </p>

      <h2>9. Changes to this policy</h2>
      <p>
        We will update this page when our practices change and update the
        "Last updated" date at the top. Material changes will be emailed to
        active users.
      </p>

      <h2>10. Contact</h2>
      <p>
        Privacy questions, requests, or complaints:{" "}
        <a href="mailto:hello@knomadic.io">hello@knomadic.io</a>.
      </p>
    </LegalLayout>
  );
}
