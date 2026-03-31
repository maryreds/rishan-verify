interface CredentialExpiryEmailParams {
  candidateName: string;
  credentialName: string;
  expiryDate: string;
  dashboardUrl: string;
}

export function credentialExpiryEmail({
  candidateName,
  credentialName,
  expiryDate,
  dashboardUrl,
}: CredentialExpiryEmailParams): { subject: string; html: string } {
  return {
    subject: `Your ${credentialName} credential expires on ${expiryDate}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 0;">
        <div style="text-align: center; margin-bottom: 32px;">
          <span style="font-size: 20px; font-weight: 700; color: #0D7C66;">&#9745; Vouch</span>
        </div>
        <h1 style="font-size: 22px; font-weight: 600; color: #1A1A1A; margin-bottom: 8px;">
          Hi ${candidateName},
        </h1>
        <p style="font-size: 15px; color: #6B6560; line-height: 1.6;">
          Your <strong>${credentialName}</strong> credential expires on <strong>${expiryDate}</strong>. Renew it to keep your verified badge active on your Vouch Profile.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background: #0D7C66; color: #ffffff; font-weight: 600; font-size: 15px; text-decoration: none; border-radius: 10px;">
            Update Credentials
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
