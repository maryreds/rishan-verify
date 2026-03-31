import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { sendEmail } from "@/lib/email";
import { referenceRequestEmail } from "@/lib/email-templates/reference-request";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, title, company, relationship } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const token = crypto.randomUUID();

    // Get the candidate's name for the email
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const candidateName = profile?.full_name || "A candidate";

    const { data, error } = await supabase
      .from("references")
      .insert({
        profile_id: user.id,
        referee_name: name,
        referee_email: email,
        referee_title: title || null,
        referee_company: company || null,
        relationship: relationship || null,
        status: "pending",
        token,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send reference request email
    const questionnaireUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reference/${token}`;
    const { subject, html } = referenceRequestEmail({
      candidateName,
      refereeName: name,
      questionnaireUrl,
    });

    await sendEmail({ to: email, subject, html });

    return NextResponse.json({ reference: data });
  } catch (error) {
    console.error("Reference request error:", error);
    return NextResponse.json(
      { error: "Failed to request reference" },
      { status: 500 }
    );
  }
}
