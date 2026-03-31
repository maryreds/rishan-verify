import { createClient } from "@/lib/supabase-server";
import { CommunityThreadClient } from "@/components/dashboard/community-thread";
import { notFound } from "next/navigation";

export default async function CommunityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Look up community by slug
  const { data: community } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!community) {
    notFound();
  }

  // Fetch initial messages
  const { data: messages } = await supabase
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
    .eq("community_id", community.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <CommunityThreadClient
        community={community}
        initialMessages={messages || []}
      />
    </div>
  );
}
