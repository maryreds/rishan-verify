import { NextResponse } from "next/server";
import mammoth from "mammoth";

// ---------- Types ----------
interface Experience {
  company: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
}

interface Education {
  institution: string;
  degree: string | null;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
}

interface ParsedResume {
  full_name: string | null;
  phone: string | null;
  location: string | null;
  headline: string | null;
  summary: string | null;
  skills: string[];
  domains: string[];
  experience: Experience[];
  education: Education[];
}

// ---------- Prompt ----------

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

// ---------- Gemini API ----------

async function callGemini(
  parts: Record<string, unknown>[]
): Promise<ParsedResume> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("NO_API_KEY");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      }),
    }
  );

  if (response.status === 429) {
    throw new Error(
      "RATE_LIMITED: AI service quota exceeded. Please try again in a few minutes."
    );
  }

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Gemini API error:", response.status, errorBody);
    throw new Error(`Gemini API returned ${response.status}`);
  }

  const result = await response.json();
  const content =
    result?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  if (!content) {
    console.error("Gemini empty response:", JSON.stringify(result));
    throw new Error("Gemini returned empty response");
  }

  const jsonStr = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(jsonStr) as ParsedResume;
}

// ---------- Text extraction ----------

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const uint8 = new Uint8Array(buffer);
    const doc = await pdfjsLib.getDocument({
      data: uint8,
      useSystemFonts: true,
    }).promise;

    const pages: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items
        .filter((item: Record<string, unknown>) => "str" in item)
        .map((item: Record<string, unknown>) => item.str as string);
      pages.push(strings.join(" "));
    }
    return pages.join("\n\n").trim();
  } catch (e) {
    console.error("pdfjs extraction failed:", e);
    return "";
  }
}

async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

// ---------- Route handler ----------

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "Missing file or userId" },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    const allowedTypes = [".pdf", ".docx", ".doc", ".txt"];
    const ext = fileName.substring(fileName.lastIndexOf("."));
    if (!allowedTypes.includes(ext)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${ext}. Allowed: ${allowedTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10 MB." },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Resume parsing is not configured (missing API key)." },
        { status: 503 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
      if (ext === ".pdf") {
        // Try text extraction first (cheap)
        const extractedText = await extractTextFromPDF(buffer);

        if (extractedText.length > 50) {
          console.log(`PDF: extracted ${extractedText.length} chars via pdfjs`);
          return NextResponse.json(
            await callGemini([
              {
                text: `${PARSE_PROMPT}\n\nResume text:\n${extractedText.slice(0, 30000)}`,
              },
            ])
          );
        }

        // Design-tool PDF: send as base64 for visual reading
        console.log("PDF: no text extracted, sending as base64");
        const base64 = buffer.toString("base64");
        return NextResponse.json(
          await callGemini([
            { inlineData: { mimeType: "application/pdf", data: base64 } },
            { text: PARSE_PROMPT },
          ])
        );
      }

      if (ext === ".docx" || ext === ".doc") {
        const text = await extractTextFromDOCX(buffer);
        console.log(`DOCX: extracted ${text.length} chars via mammoth`);

        if (text.length < 20) {
          return NextResponse.json(
            { error: "Could not extract text from the document." },
            { status: 422 }
          );
        }

        return NextResponse.json(
          await callGemini([
            {
              text: `${PARSE_PROMPT}\n\nResume text:\n${text.slice(0, 30000)}`,
            },
          ])
        );
      }

      // .txt
      const text = buffer.toString("utf-8");
      return NextResponse.json(
        await callGemini([
          { text: `${PARSE_PROMPT}\n\nResume text:\n${text.slice(0, 30000)}` },
        ])
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
        return NextResponse.json(
          { error: "Resume parsing is not configured." },
          { status: 503 }
        );
      }

      console.error("Parsing error:", message);
      return NextResponse.json(
        { error: "Failed to parse resume. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Resume parsing error:", error);
    return NextResponse.json(
      { error: "Failed to parse resume" },
      { status: 500 }
    );
  }
}
