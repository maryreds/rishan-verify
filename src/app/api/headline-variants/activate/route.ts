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

    const { variantId } = await request.json();

    if (!variantId) {
      return NextResponse.json({ error: "Missing variantId" }, { status: 400 });
    }

    // Verify the variant belongs to this user
    const { data: variant } = await supabase
      .from("headline_variants")
      .select("id, profile_id, headline")
      .eq("id", variantId)
      .single();

    if (!variant || variant.profile_id !== user.id) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    // Deactivate all variants for this profile
    await supabase
      .from("headline_variants")
      .update({ is_active: false })
      .eq("profile_id", user.id);

    // Activate the selected variant
    await supabase
      .from("headline_variants")
      .update({ is_active: true })
      .eq("id", variantId);

    // Update the profile headline
    await supabase
      .from("profiles")
      .update({ headline: variant.headline })
      .eq("id", user.id);

    return NextResponse.json({ success: true, headline: variant.headline });
  } catch (error) {
    console.error("Activate variant error:", error);
    return NextResponse.json(
      { error: "Failed to activate variant" },
      { status: 500 }
    );
  }
}
