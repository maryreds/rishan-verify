"use client";

import { useState } from "react";
import {
  Users,
  Loader2,
  Send,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Profile {
  full_name: string | null;
  photo_original_url: string | null;
}

interface Message {
  id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  author_id: string;
  profiles: Profile | Profile[] | null;
}

interface Community {
  id: string;
  name: string;
  description: string;
  community_type: string;
  slug: string;
  member_count: number;
}

function getAuthorProfile(msg: Message): Profile {
  if (!msg.profiles) return { full_name: null, photo_original_url: null };
  if (Array.isArray(msg.profiles)) return msg.profiles[0] || { full_name: null, photo_original_url: null };
  return msg.profiles;
}

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function AuthorAvatar({ profile }: { profile: Profile }) {
  const initials = (profile.full_name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (profile.photo_original_url) {
    return (
      <img
        src={profile.photo_original_url}
        alt={profile.full_name || "User"}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
      />
    );
  }

  return (
    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
      {initials}
    </div>
  );
}

export function CommunityThreadClient({
  community,
  initialMessages,
}: {
  community: Community;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [posting, setPosting] = useState(false);

  async function postMessage() {
    if (!newMessage.trim()) return;

    setPosting(true);
    try {
      const res = await fetch(
        `/api/communities/${community.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newMessage }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to post message");
      }

      setNewMessage("");

      // Refetch messages
      const listRes = await fetch(
        `/api/communities/${community.id}/messages`
      );
      if (listRes.ok) {
        const result = await listRes.json();
        setMessages(result.messages || []);
      }

      toast.success("Message posted!");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Back link + header */}
      <div>
        <Link
          href="/dashboard/communities"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          All Communities
        </Link>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">{community.name}</CardTitle>
                {community.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {community.description}
                  </p>
                )}
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {community.member_count}
              </Badge>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* New message input */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Textarea
              placeholder="Write a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={3}
              className="resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  postMessage();
                }
              }}
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                Press Cmd+Enter to send
              </span>
              <Button
                size="sm"
                disabled={posting || !newMessage.trim()}
                onClick={postMessage}
              >
                {posting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Send className="w-4 h-4 mr-1" />
                )}
                Post
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      {messages.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center gap-3">
            <MessageCircle className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Be the first to post! Start a conversation with the community.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const profile = getAuthorProfile(msg);

            return (
              <Card key={msg.id}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <AuthorAvatar profile={profile} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium truncate">
                          {profile.full_name || "Anonymous"}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">
                          {formatTimestamp(msg.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
