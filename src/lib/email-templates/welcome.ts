interface WelcomeEmailParams {
  firstName: string;
  dashboardUrl: string;
}

export function welcomeEmail({
  firstName,
  dashboardUrl,
}: WelcomeEmailParams): { subject: string; html: string } {
  const safeName = firstName?.trim() || "there";

  return {
    subject: "Welcome to Vouch — get verified in 5 minutes",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 0;">
        <div style="text-align: center; margin-bottom: 32px;">
          <span style="font-size: 20px; font-weight: 700; color: #265140;">&#9745; Vouch</span>
        </div>
        <h1 style="font-size: 22px; font-weight: 600; color: #1A1A1A; margin-bottom: 8px;">
          Welcome, ${safeName}.
        </h1>
        <p style="font-size: 15px; color: #6B6560; line-height: 1.6;">
          Vouch turns your r&eacute;sum&eacute; into a verified profile employers actually trust. Identity, work auth, references, credentials &mdash; all checked once, carried everywhere via your portable Vouch badge.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background: #265140; color: #ffffff; font-weight: 600; font-size: 15px; text-decoration: none; border-radius: 10px;">
            Continue building your profile
          </a>
        </div>
        <h2 style="font-size: 16px; font-weight: 600; color: #1A1A1A; margin-bottom: 12px;">
          What happens next
        </h2>
        <ol style="font-size: 15px; color: #6B6560; line-height: 1.6; padding-left: 20px; margin: 0 0 24px 0;">
          <li style="margin-bottom: 8px;">Upload your r&eacute;sum&eacute; and we auto-fill the rest.</li>
          <li style="margin-bottom: 8px;">Verify your identity in under 2 minutes via Persona.</li>
          <li style="margin-bottom: 8px;">Get a portable badge you can share to LinkedIn.</li>
        </ol>
        <p style="font-size: 13px; color: #9B9590; line-height: 1.6;">
          If you didn&rsquo;t sign up, ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #E8E2DB; margin: 32px 0;" />
        <p style="font-size: 12px; color: #9B9590; text-align: center;">
          Vouch — The verified candidate marketplace
        </p>
      </div>
    `,
  };
}
