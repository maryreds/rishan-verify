import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { jobs } = await request.json();

    if (!Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty jobs array" },
        { status: 400 }
      );
    }

    const rows = jobs.map((job) => ({
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      required_skills: job.required_skills || [],
      salary_min: job.salary_min ?? null,
      salary_max: job.salary_max ?? null,
      job_type: job.job_type ?? null,
      source: "import",
      is_active: true,
    }));

    const { error } = await supabase.from("jobs").insert(rows);

    if (error) {
      console.error("Job import error:", error);
      return NextResponse.json(
        { error: "Failed to import jobs" },
        { status: 500 }
      );
    }

    return NextResponse.json({ imported: rows.length });
  } catch (error) {
    console.error("Job import error:", error);
    return NextResponse.json(
      { error: "Failed to import jobs" },
      { status: 500 }
    );
  }
}
