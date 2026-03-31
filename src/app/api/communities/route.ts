import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Try to get authenticated user (optional for GET)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: communities, error } = await supabase
      .from("communities")
      .select("*")
      .order("member_count", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch communities" },
        { status: 500 }
      );
    }

    // If user is authenticated, check membership for each community
    let memberships: Set<string> = new Set();
    if (user) {
      const { data: memberRecords } = await supabase
        .from("community_members")
        .select("community_id")
        .eq("profile_id", user.id);

      if (memberRecords) {
        memberships = new Set(
          memberRecords.map((m: { community_id: string }) => m.community_id)
        );
      }
    }

    const result = (communities || []).map((c) => ({
      ...c,
      is_member: memberships.has(c.id),
    }));

    return NextResponse.json({ communities: result });
  } catch (error) {
    console.error("Communities fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch communities" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { communityId, action } = await request.json();

    if (!communityId || !["join", "leave"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid communityId or action" },
        { status: 400 }
      );
    }

    if (action === "join") {
      // Check if already a member
      const { data: existing } = await supabase
        .from("community_members")
        .select("id")
        .eq("community_id", communityId)
        .eq("profile_id", user.id)
        .single();

      if (!existing) {
        const { error } = await supabase.from("community_members").insert({
          community_id: communityId,
          profile_id: user.id,
          role: "member",
        });

        if (error) {
          console.error("Join community error:", error);
          return NextResponse.json(
            { error: "Failed to join community" },
            { status: 500 }
          );
        }

        // Increment member count
        await supabase.rpc("increment_member_count", {
          cid: communityId,
        }).then(async (res) => {
          // Fallback if RPC doesn't exist: manual update
          if (res.error) {
            const { data: community } = await supabase
              .from("communities")
              .select("member_count")
              .eq("id", communityId)
              .single();
            await supabase
              .from("communities")
              .update({ member_count: (community?.member_count || 0) + 1 })
              .eq("id", communityId);
          }
        });
      }
    } else {
      // Leave
      const { error } = await supabase
        .from("community_members")
        .delete()
        .eq("community_id", communityId)
        .eq("profile_id", user.id);

      if (error) {
        console.error("Leave community error:", error);
        return NextResponse.json(
          { error: "Failed to leave community" },
          { status: 500 }
        );
      }

      // Decrement member count
      await supabase.rpc("decrement_member_count", {
        cid: communityId,
      }).then(async (res) => {
        if (res.error) {
          const { data: community } = await supabase
            .from("communities")
            .select("member_count")
            .eq("id", communityId)
            .single();
          await supabase
            .from("communities")
            .update({
              member_count: Math.max((community?.member_count || 1) - 1, 0),
            })
            .eq("id", communityId);
        }
      });
    }

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error("Community action error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
