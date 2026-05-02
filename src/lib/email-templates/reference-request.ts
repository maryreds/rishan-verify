interface ReferenceRequestEmailParams {
  candidateName: string;
  refereeName: string;
  questionnaireUrl: string;
}

export function referenceRequestEmail({
  candidateName,
  refereeName,
  questionnaireUrl,
}: ReferenceRequestEmailParams): { subject: string; html: string } {
  return {
    subject: `${candidateName} has requested a professional reference from you`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 0;">
        <div style="text-align: center; margin-bottom: 32px;">
          <span style="font-size: 20px; font-weight: 700; color: #265140;">&#9745; Vouch</span>
        </div>
        <h1 style="font-size: 22px; font-weight: 600; color: #1A1A1A; margin-bottom: 8px;">
          Hi ${refereeName},
        </h1>
        <p style="font-size: 15px; color: #6B6560; line-height: 1.6;">
          <strong>${candidateName}</strong> has listed you as a professional reference on Vouch, the verified candidate marketplace.
        </p>
        <p style="font-size: 15px; color: #6B6560; line-height: 1.6;">
          Please take a few minutes to complete the questionnaire. Your feedback helps ${candidateName} stand out to employers.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${questionnaireUrl}" style="display: inline-block; padding: 14px 32px; background: #265140; color: #ffffff; font-weight: 600; font-size: 15px; text-decoration: none; border-radius: 10px;">
            Complete Reference
          </a>
        </div>
        <p style="font-size: 13px; color: #9B9590; line-height: 1.5;">
          This link is unique to you and will expire in 14 days. Your responses are confidential.
        </p>
        <hr style="border: none; border-top: 1px solid #E8E2DB; margin: 32px 0;" />
        <p style="font-size: 12px; color: #9B9590; text-align: center;">
          Vouch — The verified candidate marketplace
        </p>
      </div>
    `,
  };
}
