interface ReferralInviteEmailParams {
  referrerName: string;
  signupUrl: string;
}

export function referralInviteEmail({
  referrerName,
  signupUrl,
}: ReferralInviteEmailParams): { subject: string; html: string } {
  return {
    subject: `${referrerName} invited you to join Vouch`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 0;">
        <div style="text-align: center; margin-bottom: 32px;">
          <span style="font-size: 20px; font-weight: 700; color: #0D7C66;">&#9745; Vouch</span>
        </div>
        <h1 style="font-size: 22px; font-weight: 600; color: #1A1A1A; margin-bottom: 8px;">
          You&rsquo;ve been invited!
        </h1>
        <p style="font-size: 15px; color: #6B6560; line-height: 1.6;">
          <strong>${referrerName}</strong> thinks you'd be a great fit for Vouch &mdash; the verified candidate marketplace where top professionals get discovered by employers.
        </p>
        <p style="font-size: 15px; color: #6B6560; line-height: 1.6;">
          Build your Vouch Profile, verify your credentials, and let opportunities come to you.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${signupUrl}" style="display: inline-block; padding: 14px 32px; background: #0D7C66; color: #ffffff; font-weight: 600; font-size: 15px; text-decoration: none; border-radius: 10px;">
            Join Vouch Free
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #E8E2DB; margin: 32px 0;" />
        <p style="font-size: 12px; color: #9B9590; text-align: center;">
          Vouch — The verified candidate marketplace
        </p>
      </div>
    `,
  };
}
