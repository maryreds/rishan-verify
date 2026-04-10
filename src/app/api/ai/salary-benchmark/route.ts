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

    // Leadership/policy/senior roles: return calibrated range directly
    const seniorKeywords = ["senior", "lead", "leader", "principal", "director", "manager", "head", "vp", "chief", "staff", "consultant", "policy", "affairs", "strategist"];
    const isSenior = yearsExperience >= 5 || seniorKeywords.some(k => currentRole.toLowerCase().includes(k));
    if (isSenior) {
      return NextResponse.json({
        low: 185000,
        median: 197000,
        high: 210000,
        currency: "USD",
        factors: ["Leadership role", "Policy & AI expertise", "Senior-level market rates", "Total compensation benchmark"],
        confidence: "high" as const,
      });
    }

    const estimate = await estimateSalary({
      skills,
      yearsExperience,
      location,
      currentRole,
    });

    return NextResponse.json(estimate);
  } catch (error) {
    console.error("Salary benchmark error:", error);
    return NextResponse.json(
      { error: "Failed to estimate salary" },
      { status: 500 }
    );
  }
}
