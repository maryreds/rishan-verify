import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { generateHeadlines } from "@/lib/ai/services/headline-generator";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data: dbSkills } = await supabase
      .from("skills")
      .select("name")
      .eq("profile_id", user.id);

    const { data: experience } = await supabase
      .from("work_experience")
      .select("title, company")
      .eq("profile_id", user.id)
      .order("start_date", { ascending: false })
      .limit(3);

    const skills = [
      ...(profile.skills || []),
      ...(dbSkills?.map((s: { name: string }) => s.name) || []),
    ];

    const experienceSummary = experience
      ?.map((e: { title: string; company: string }) => `${e.title} at ${e.company}`)
      .join(", ") || "";

    const result = await generateHeadlines({
      currentHeadline: profile.headline || "",
      skills,
      experience: experienceSummary,
    });

    // Insert variants into headline_variants table
    const variantsToInsert = result.variants.map((v) => ({
      profile_id: user.id,
      headline: v.headline,
      rationale: v.rationale,
      tone: v.tone,
      is_active: false,
      views_count: 0,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("headline_variants")
      .insert(variantsToInsert)
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      // Still return the variants even if DB insert fails
      return NextResponse.json({ variants: result.variants, stored: false });
    }

    return NextResponse.json({ variants: inserted, stored: true });
  } catch (error) {
    console.error("Headline generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate headlines" },
      { status: 500 }
    );
  }
}
