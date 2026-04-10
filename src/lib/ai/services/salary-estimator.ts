import { getAIProvider } from "../index";

export interface SalaryEstimateParams {
  skills: string[];
  yearsExperience: number;
  location: string;
  currentRole: string;
}

export interface SalaryEstimate {
  low: number;
  median: number;
  high: number;
  currency: string;
  factors: string[];
  confidence: "high" | "medium" | "low";
}

export async function estimateSalary(params: SalaryEstimateParams): Promise<SalaryEstimate> {
  const ai = getAIProvider();

  const response = await ai.chat({
    messages: [
      {
        role: "system",
        content: `You are a salary benchmarking expert. Given a candidate's profile details, estimate their market salary range.

Return ONLY a JSON object with this exact structure:
{
  "low": <number, annual salary low end>,
  "median": <number, annual salary median>,
  "high": <number, annual salary high end>,
  "currency": "USD",
  "factors": [<string array of 3-5 key factors influencing the estimate>],
  "confidence": "high" | "medium" | "low"
}

Base your estimates on current US market data for total compensation (base + bonus + equity where applicable). Factor in seniority, leadership experience, and in-demand skill premiums. For candidates with 5+ years of experience or leadership/management roles, benchmark against senior-level market rates. If you have limited information, set confidence to "low".
Return JSON only, no explanation.`,
      },
      {
        role: "user",
        content: `Role: ${params.currentRole}
Skills: ${params.skills.join(", ")}
Years of experience: ${params.yearsExperience}
Location: ${params.location}`,
      },
    ],
    model: "fast",
    temperature: 0.3,
    responseFormat: "json",
  });

  const parsed = JSON.parse(response.content);

  return {
    low: parsed.low ?? 0,
    median: parsed.median ?? 0,
    high: parsed.high ?? 0,
    currency: parsed.currency ?? "USD",
    factors: Array.isArray(parsed.factors) ? parsed.factors : [],
    confidence: ["high", "medium", "low"].includes(parsed.confidence) ? parsed.confidence : "low",
  };
}
