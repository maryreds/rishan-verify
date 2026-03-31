import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: communityId } = await params;
    const supabase = await createClient();

    const { data: messages, error } = await supabase
      .from("community_messages")
      .select(
        `
        id,
        content,
        parent_id,
        created_at,
        author_id,
        profiles:author_id (
          full_name,
          photo_original_url
        )
      `
      )
      .eq("community_id", communityId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Fetch messages error:", error);
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    console.error("Messages fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: communityId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, parentId } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const { data: message, error } = await supabase
      .from("community_messages")
      .insert({
        community_id: communityId,
        author_id: user.id,
        content: content.trim(),
        parent_id: parentId || null,
      })
      .select(
        `
        id,
        content,
        parent_id,
        created_at,
        author_id,
        profiles:author_id (
          full_name,
          photo_original_url
        )
      `
      )
      .single();

    if (error) {
      console.error("Post message error:", error);
      return NextResponse.json(
        { error: "Failed to post message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Post message error:", error);
    return NextResponse.json(
      { error: "Failed to post message" },
      { status: 500 }
    );
  }
}
