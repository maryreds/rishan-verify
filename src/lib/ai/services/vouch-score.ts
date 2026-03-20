interface ScoreInput {
  full_name?: string | null;
  headline?: string | null;
  summary?: string | null;
  location?: string | null;
  skills_count: number;
  photo_url?: string | null;
  experience_count: number;
  experience_with_descriptions: number;
  education_count: number;
  verification_identity: boolean;
  verification_work_auth: boolean;
  verification_background: boolean;
  portfolio_count: number;
  assessments_count: number;
}

interface ScoreBreakdown {
  total: number;
  completeness: number;
  experience: number;
  education: number;
  verification: number;
  engagement: number;
}

export function calculateVouchScore(input: ScoreInput): ScoreBreakdown {
  // Profile completeness: 0-30 pts
  let completeness = 0;
  if (input.full_name) completeness += 5;
  if (input.headline) completeness += 5;
  if (input.summary) completeness += 5;
  if (input.location) completeness += 5;
  if (input.skills_count > 0) completeness += 5;
  if (input.photo_url) completeness += 5;

  // Work experience: 0-20 pts
  let experience = 0;
  experience += Math.min(input.experience_count * 4, 12);
  experience += Math.min(input.experience_with_descriptions * 2, 8);

  // Education: 0-10 pts
  const education = Math.min(input.education_count * 5, 10);

  // Verification depth: 0-30 pts
  let verification = 0;
  if (input.verification_identity) verification += 15;
  if (input.verification_work_auth) verification += 10;
  if (input.verification_background) verification += 5;

  // Engagement: 0-10 pts
  let engagement = 0;
  engagement += Math.min(input.portfolio_count * 3, 6);
  engagement += Math.min(input.assessments_count * 2, 4);

  const total = completeness + experience + education + verification + engagement;

  return {
    total: Math.min(total, 100),
    completeness,
    experience,
    education,
    verification,
    engagement,
  };
}
