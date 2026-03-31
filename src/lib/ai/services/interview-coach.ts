import { getAIProvider } from "../index";

interface GenerateQuestionParams {
  targetRole: string;
  targetCompany?: string;
  previousMessages: Array<{ role: string; content: string }>;
}

interface GenerateQuestionResult {
  question: string;
  category: "behavioral" | "technical" | "situational";
}

interface EvaluateAnswerParams {
  question: string;
  answer: string;
  targetRole: string;
}

interface EvaluateAnswerResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

interface GenerateOverallFeedbackParams {
  targetRole: string;
  messages: Array<{ role: string; content: string }>;
}

interface OverallFeedbackResult {
  overall_score: number;
  summary: string;
  strengths: string[];
  areas_for_improvement: string[];
}

export async function generateInterviewQuestion(
  params: GenerateQuestionParams
): Promise<GenerateQuestionResult> {
  const ai = getAIProvider();

  const previousContext =
    params.previousMessages.length > 0
      ? `\n\nPrevious conversation:\n${params.previousMessages.map((m) => `${m.role}: ${m.content}`).join("\n")}`
      : "";

  const companyContext = params.targetCompany
    ? ` at ${params.targetCompany}`
    : "";

  const response = await ai.chat({
    messages: [
      {
        role: "system",
        content: `You are an expert interviewer conducting a practice interview for a candidate applying for a ${params.targetRole} role${companyContext}.

Ask one interview question at a time. Vary between behavioral, technical, and situational questions. Make questions specific and relevant to the role.

If there are previous messages, avoid repeating similar topics and progressively increase difficulty.

Respond with JSON only in this exact format:
{
  "question": "Your interview question here",
  "category": "behavioral"|"technical"|"situational"
}`,
      },
      {
        role: "user",
        content: `Generate the next interview question for this ${params.targetRole} practice interview.${previousContext}`,
      },
    ],
    model: "standard",
    temperature: 0.5,
    maxTokens: 500,
    responseFormat: "json",
  });

  return JSON.parse(response.content) as GenerateQuestionResult;
}

export async function evaluateAnswer(
  params: EvaluateAnswerParams
): Promise<EvaluateAnswerResult> {
  const ai = getAIProvider();

  const response = await ai.chat({
    messages: [
      {
        role: "system",
        content: `You are an expert interview coach evaluating a candidate's answer for a ${params.targetRole} position.

Score the answer from 1-10 based on:
- Relevance and directness
- Use of specific examples (STAR method for behavioral)
- Communication clarity
- Depth of knowledge (for technical questions)
- Problem-solving approach (for situational questions)

Be constructive but honest. Provide specific, actionable feedback.

Respond with JSON only in this exact format:
{
  "score": <number 1-10>,
  "feedback": "2-3 sentence evaluation",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"]
}`,
      },
      {
        role: "user",
        content: `Question: ${params.question}\n\nCandidate's Answer: ${params.answer}`,
      },
    ],
    model: "standard",
    temperature: 0.3,
    maxTokens: 800,
    responseFormat: "json",
  });

  return JSON.parse(response.content) as EvaluateAnswerResult;
}

export async function generateOverallFeedback(
  params: GenerateOverallFeedbackParams
): Promise<OverallFeedbackResult> {
  const ai = getAIProvider();

  const conversationLog = params.messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const response = await ai.chat({
    messages: [
      {
        role: "system",
        content: `You are an expert interview coach providing overall feedback for a practice interview session for a ${params.targetRole} position.

Analyze the full interview conversation and provide a comprehensive assessment.

Score from 1-100 based on:
- Overall answer quality and depth
- Communication skills
- Consistency across answers
- Preparation level
- Professional presence

Respond with JSON only in this exact format:
{
  "overall_score": <number 1-100>,
  "summary": "3-4 sentence overall assessment",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "areas_for_improvement": ["area 1", "area 2", "area 3"]
}`,
      },
      {
        role: "user",
        content: `Here is the full interview conversation:\n\n${conversationLog}`,
      },
    ],
    model: "standard",
    temperature: 0.3,
    maxTokens: 1000,
    responseFormat: "json",
  });

  return JSON.parse(response.content) as OverallFeedbackResult;
}
