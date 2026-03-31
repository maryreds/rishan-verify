import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, issuer, credential_type, issue_date, expiry_date, credential_url } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (issuer !== undefined) updateData.issuer = issuer;
    if (credential_type !== undefined) updateData.credential_type = credential_type;
    if (issue_date !== undefined) updateData.issue_date = issue_date;
    if (expiry_date !== undefined) updateData.expiry_date = expiry_date;
    if (credential_url !== undefined) updateData.credential_url = credential_url;

    const { data, error } = await supabase
      .from("credentials")
      .update(updateData)
      .eq("id", id)
      .eq("profile_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ credential: data });
  } catch (error) {
    console.error("Credential update error:", error);
    return NextResponse.json(
      { error: "Failed to update credential" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("credentials")
      .delete()
      .eq("id", id)
      .eq("profile_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Credential delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete credential" },
      { status: 500 }
    );
  }
}
