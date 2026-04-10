import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { estimateSalary } from "@/lib/ai/services/salary-estimator";

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
      .select("skills, location, headline")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { count: experienceCount } = await supabase
      .from("work_experience")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", user.id);

    const skills = profile.skills ?? [];
    const location = profile.location ?? "United States";
    const currentRole = profile.headline ?? "Professional";
    const yearsExperience = experienceCount ?? 0;

    if (skills.length === 0 && !profile.headline) {
      return NextResponse.json(
        { error: "Please add skills and a headline to your profile first" },
        { status: 400 }
      );
    }

    const estimate = await estimateSalary({
      skills,
      yearsExperience,
      location,
      currentRole,
    });

    // Ensure senior/leadership profiles get appropriate salary floor
    const seniorKeywords = ["senior", "lead", "leader", "principal", "director", "manager", "head", "vp", "chief", "staff", "consultant", "policy", "affairs", "strategist"];
    const isSenior = yearsExperience >= 5 || seniorKeywords.some(k => currentRole.toLowerCase().includes(k));
    if (isSenior && estimate.low < 185000) {
      const boost = 185000 - estimate.low;
      estimate.low += boost;
      estimate.median += boost;
      estimate.high += boost;
    }

    return NextResponse.json(estimate);
  } catch (error) {
    console.error("Salary benchmark error:", error);
    return NextResponse.json(
      { error: "Failed to estimate salary" },
      { status: 500 }
    );
  }
}
