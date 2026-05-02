import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { parseResume, parseResumeFromImage } from "@/lib/ai/services/resume-parser";
import { requireAuth } from "@/lib/api-auth";

// ---------- Gemini fallback (kept for AI_PROVIDER=gemini) ----------

interface GeminiParsedResume {
  full_name: string | null;
  phone: string | null;
  location: string | null;
  headline: string | null;
  summary: string | null;
  skills: string[];
  domains: string[];
  experience: { company: string; title: string; start_date: string | null; end_date: string | null; is_current: boolean; description: string | null }[];
  education: { institution: string; degree: string | null; field_of_study: string | null; start_date: string | null; end_date: string | null }[];
}

const PARSE_PROMPT = `You are a resume parsing assistant. Extract structured data from this resume. Return ONLY valid JSON with exactly this schema:
{
  "full_name": string | null,
  "phone": string | null,
  "location": string | null,
  "headline": string | null,
  "summary": string | null,
  "skills": string[],
  "domains": string[],
  "experience": [{ "company": string, "title": string, "start_date": string | null, "end_date": string | null, "is_current": boolean, "description": string | null }],
  "education": [{ "institution": string, "degree": string | null, "field_of_study": string | null, "start_date": string | null, "end_date": string | null }]
}
Rules:
- "headline" = short professional title like "Senior Software Engineer"
- "domains" = broad professional domains (e.g. "Finance", "Healthcare")
- "skills" = specific technical or soft skills mentioned
- If a field is not found, use null for scalars or [] for arrays
- Do NOT invent data not in the resume`;

async function callGemini(parts: Record<string, unknown>[]): Promise<GeminiParsedResume> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("NO_API_KEY");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
      }),
    }
  );

  if (response.status === 429) throw new Error("RATE_LIMITED: AI service quota exceeded.");
  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Gemini API error:", response.status, errorBody);
    throw new Error(`Gemini API returned ${response.status}`);
  }

  const result = await response.json();
  const content = result?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!content) throw new Error("Gemini returned empty response");

  const jsonStr = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(jsonStr);
}

// ---------- Text extraction ----------

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Primary: use unpdf (works reliably in Node/serverless/Turbopack)
  try {
    const { extractText } = await import("unpdf");
    const uint8 = new Uint8Array(buffer);
    const result = await extractText(uint8);
    const text = Array.isArray(result.text) ? result.text.join("\n") : result.text;
    if (text && text.trim().length > 20) {
      console.log(`PDF: extracted ${text.trim().length} chars via unpdf`);
      return text.trim();
    }
  } catch (e) {
    console.error("unpdf extraction failed:", e);
  }

  return "";
}

async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

// ---------- Route handler ----------

const useOpenAI = () => {
  const provider = (process.env.AI_PROVIDER || "openai").trim();
  return provider === "openai" && !!(process.env.OPENAI_API_KEY || "").trim();
};

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const allowedTypes = [".pdf", ".docx", ".doc", ".txt"];
    const ext = fileName.substring(fileName.lastIndexOf("."));
    if (!allowedTypes.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${ext}. Allowed: ${allowedTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 10 MB." }, { status: 400 });
    }

    const openaiReady = useOpenAI();
    const geminiReady = !!(process.env.GEMINI_API_KEY || "").trim();
    console.log(`[parse-resume] AI_PROVIDER=${(process.env.AI_PROVIDER || "").trim()}, openaiReady=${openaiReady}, geminiReady=${geminiReady}, OPENAI_KEY_len=${(process.env.OPENAI_API_KEY || "").trim().length}`);
    if (!openaiReady && !geminiReady) {
      return NextResponse.json(
        { error: "Resume parsing is not configured (missing API key)." },
        { status: 503 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
      if (ext === ".pdf") {
        const extractedText = await extractTextFromPDF(buffer);

        if (extractedText.length > 50) {
          console.log(`PDF: extracted ${extractedText.length} chars via pdfjs`);
          if (useOpenAI()) {
            return NextResponse.json(await parseResume(extractedText));
          }
          return NextResponse.json(
            await callGemini([{ text: `${PARSE_PROMPT}\n\nResume text:\n${extractedText.slice(0, 30000)}` }])
          );
        }

        // Design-tool / scanned PDF: no extractable text
        console.log("PDF: no text extracted, trying as image");
        if (!useOpenAI()) {
          // Gemini can handle PDF base64 natively
          const base64 = buffer.toString("base64");
          return NextResponse.json(
            await callGemini([
              { inlineData: { mimeType: "application/pdf", data: base64 } },
              { text: PARSE_PROMPT },
            ])
          );
        }
        // OpenAI vision only supports image types — return helpful error
        return NextResponse.json(
          { error: "Could not extract text from this PDF. It may be a scanned image. Please try uploading a text-based PDF, DOCX, or TXT file instead." },
          { status: 422 }
        );
      }

      if (ext === ".docx" || ext === ".doc") {
        const text = await extractTextFromDOCX(buffer);
        if (text.length < 20) {
          return NextResponse.json({ error: "Could not extract text from the document." }, { status: 422 });
        }
        if (useOpenAI()) {
          return NextResponse.json(await parseResume(text));
        }
        return NextResponse.json(
          await callGemini([{ text: `${PARSE_PROMPT}\n\nResume text:\n${text.slice(0, 30000)}` }])
        );
      }

      // .txt
      const text = buffer.toString("utf-8");
      if (useOpenAI()) {
        return NextResponse.json(await parseResume(text));
      }
      return NextResponse.json(
        await callGemini([{ text: `${PARSE_PROMPT}\n\nResume text:\n${text.slice(0, 30000)}` }])
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      if (message.startsWith("RATE_LIMITED")) {
        return NextResponse.json(
          { error: "AI service is temporarily rate-limited. Please wait a minute and try again." },
          { status: 429 }
        );
      }
      if (message === "NO_API_KEY") {
        return NextResponse.json({ error: "Resume parsing is not configured." }, { status: 503 });
      }

      console.error("Parsing error:", message);
      return NextResponse.json({ error: "Failed to parse resume. Please try again." }, { status: 500 });
    }
  } catch (error) {
    console.error("Resume parsing error:", error);
    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 });
  }
}
