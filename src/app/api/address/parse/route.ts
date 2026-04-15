import { NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai";
import { createClient } from "@/lib/supabase-server";

interface ParsedAddress {
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  document_date: string | null;
  document_type: string | null;
}

const ADDRESS_PROMPT = `You are a document parsing assistant. This is a photo of a document (utility bill, lease, or bank statement). Extract the following information and return ONLY valid JSON with exactly this schema:
{
  "street": string | null,
  "city": string | null,
  "state": string | null,
  "zip": string | null,
  "document_date": string | null,
  "document_type": string | null
}
Rules:
- "street" = full street address (e.g. "123 Main St Apt 4")
- "city" = city name
- "state" = state abbreviation (e.g. "TX", "CA", "NY")
- "zip" = zip code (5 digits or ZIP+4)
- "document_date" = the date on the document in YYYY-MM-DD format
- "document_type" = one of: "utility_bill", "lease", "bank_statement", or "other"
- If a field cannot be found, use null
- Do NOT invent data not present in the document`;

export async function POST(request: Request) {
  try {
    const { imageBase64, profileId } = await request.json();

    if (!imageBase64 || !profileId) {
      return NextResponse.json(
        { error: "Missing imageBase64 or profileId" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Address parsing is not configured (missing API key)." },
        { status: 503 }
      );
    }

    // Parse the document image with AI vision
    const ai = getAIProvider();
    const response = await ai.vision({
      prompt: ADDRESS_PROMPT,
      imageBase64,
      imageMimeType: "image/jpeg",
      temperature: 0.1,
      maxTokens: 1024,
    });

    const content = response.content.trim();

    // Extract JSON from response (handle markdown code blocks)
    const jsonStr = content
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed: ParsedAddress;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response as JSON:", content);
      return NextResponse.json(
        { error: "Could not parse address from this document. Please try a clearer photo." },
        { status: 422 }
      );
    }

    // Save to Supabase
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("address_history")
      .insert({
        profile_id: profileId,
        street: parsed.street,
        city: parsed.city,
        state: parsed.state,
        zip: parsed.zip,
        document_date: parsed.document_date,
        document_type: parsed.document_type,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to save address data." },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Address parsing error:", error);
    return NextResponse.json(
      { error: "Failed to parse address document." },
      { status: 500 }
    );
  }
}
