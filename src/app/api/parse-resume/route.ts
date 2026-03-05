import { NextRequest, NextResponse } from "next/server";

// Simple resume parser using text extraction + structured prompting
// For MVP we extract text and use pattern matching
// Can be upgraded to use Claude API for better parsing later

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Read file as text (works for .txt and basic .pdf text extraction)
    const text = await file.text();

    // Basic pattern-based extraction for MVP
    // This handles the common case; Claude API integration can replace this later
    const parsed = parseResumeText(text);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Resume parse error:", error);
    return NextResponse.json(
      { error: "Failed to parse resume" },
      { status: 500 }
    );
  }
}

function parseResumeText(text: string) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // Extract email
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  const email = emailMatch?.[0] || null;

  // Extract phone
  const phoneMatch = text.match(
    /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/
  );
  const phone = phoneMatch?.[0] || null;

  // First non-empty line is likely the name
  const full_name = lines[0] || null;

  // Look for common section headers to split the resume
  const sections: Record<string, string[]> = {};
  let currentSection = "header";
  sections[currentSection] = [];

  const sectionPatterns = [
    { pattern: /^(?:work\s+)?experience|employment|professional/i, name: "experience" },
    { pattern: /^education|academic/i, name: "education" },
    { pattern: /^skills|technical|technologies|competencies/i, name: "skills" },
    { pattern: /^summary|objective|profile|about/i, name: "summary" },
  ];

  for (const line of lines) {
    const matched = sectionPatterns.find((s) => s.pattern.test(line));
    if (matched) {
      currentSection = matched.name;
      sections[currentSection] = [];
    } else {
      if (!sections[currentSection]) sections[currentSection] = [];
      sections[currentSection].push(line);
    }
  }

  // Extract skills from skills section
  const skillsText = (sections.skills || []).join(", ");
  const skills = skillsText
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 40);

  // Extract summary
  const summary = (sections.summary || []).join(" ").slice(0, 500) || null;

  // Basic experience extraction (company/title pairs)
  const experience: Array<{
    company: string;
    title: string;
    start_date: string | null;
    end_date: string | null;
    is_current: boolean;
    description: string | null;
  }> = [];

  if (sections.experience) {
    // Simple heuristic: look for lines with date patterns
    let currentExp: (typeof experience)[0] | null = null;
    for (const line of sections.experience) {
      const dateMatch = line.match(
        /(\d{4}|\w+\s+\d{4})\s*[-–—to]+\s*(\d{4}|\w+\s+\d{4}|present|current)/i
      );
      if (dateMatch) {
        if (currentExp) experience.push(currentExp);
        const isCurrent = /present|current/i.test(dateMatch[2]);
        currentExp = {
          company: line.replace(dateMatch[0], "").trim() || "Unknown Company",
          title: "",
          start_date: null,
          end_date: null,
          is_current: isCurrent,
          description: null,
        };
      } else if (currentExp && !currentExp.title) {
        currentExp.title = line;
      }
    }
    if (currentExp) experience.push(currentExp);
  }

  // Basic education extraction
  const education: Array<{
    institution: string;
    degree: string | null;
    field_of_study: string | null;
    start_date: string | null;
    end_date: string | null;
  }> = [];

  if (sections.education) {
    let currentEdu: (typeof education)[0] | null = null;
    for (const line of sections.education) {
      const degreeMatch = line.match(
        /(?:Bachelor|Master|Ph\.?D|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|MBA|Associate)/i
      );
      if (degreeMatch) {
        if (currentEdu) education.push(currentEdu);
        currentEdu = {
          institution: "",
          degree: degreeMatch[0],
          field_of_study: line.replace(degreeMatch[0], "").trim() || null,
          start_date: null,
          end_date: null,
        };
      } else if (currentEdu && !currentEdu.institution) {
        currentEdu.institution = line;
      }
    }
    if (currentEdu) education.push(currentEdu);
  }

  return {
    full_name,
    email,
    phone,
    location: null,
    headline: null,
    summary,
    skills: skills.slice(0, 20),
    domains: [],
    experience,
    education,
  };
}
