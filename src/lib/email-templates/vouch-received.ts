interface VouchReceivedEmailParams {
  voucherName: string;
  voucheeName: string;
  skill: string;
  message: string | null;
  signupUrl: string;
}

export function vouchReceivedEmail({
  voucherName,
  voucheeName,
  skill,
  message,
  signupUrl,
}: VouchReceivedEmailParams): { subject: string; html: string } {
  const messageBlock = message
    ? `<blockquote style="margin: 16px 0; padding: 12px 16px; border-left: 3px solid #0D7C66; background: #F3F8F6; color: #1A1A1A; font-size: 15px; line-height: 1.6; border-radius: 4px;">
         &ldquo;${message}&rdquo;
       </blockquote>`
    : "";

  return {
    subject: `${voucherName} just vouched for you on Vouch`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 0;">
        <div style="text-align: center; margin-bottom: 32px;">
          <span style="font-size: 20px; font-weight: 700; color: #0D7C66;">&#9745; Vouch</span>
        </div>
        <h1 style="font-size: 22px; font-weight: 600; color: #1A1A1A; margin-bottom: 8px;">
          Hi ${voucheeName},
        </h1>
        <p style="font-size: 15px; color: #6B6560; line-height: 1.6;">
          <strong>${voucherName}</strong> vouched for your <strong>${skill}</strong> skills on Vouch, the verified candidate marketplace.
        </p>
        ${messageBlock}
        <p style="font-size: 15px; color: #6B6560; line-height: 1.6;">
          Claim your profile to add this endorsement to your verified candidate badge — employers will see it alongside your Vouch Score.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${signupUrl}" style="display: inline-block; padding: 14px 32px; background: #0D7C66; color: #ffffff; font-weight: 600; font-size: 15px; text-decoration: none; border-radius: 10px;">
            Claim Your Vouch
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
