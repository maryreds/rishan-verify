"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessagesSquare,
  Users,
  Loader2,
  AlertCircle,
  Code,
  MapPin,
  Building2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Community {
  id: string;
  name: string;
  description: string;
  community_type: string;
  slug: string;
  member_count: number;
  is_member: boolean;
}

type GroupedCommunities = Record<string, Community[]>;

const typeConfig: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  skill: {
    label: "Skill",
    icon: Code,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  location: {
    label: "Location",
    icon: MapPin,
    color: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  industry: {
    label: "Industry",
    icon: Building2,
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
};

function getTypeConfig(type: string) {
  return (
    typeConfig[type] || {
      label: type,
      icon: MessagesSquare,
      color: "bg-muted text-muted-foreground border-border",
    }
  );
}

export function CommunityListClient() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function fetchCommunities() {
    setLoading(true);
    try {
      const res = await fetch("/api/communities");
      if (!res.ok) throw new Error("Failed to fetch communities");
      const result = await res.json();
      setCommunities(result.communities || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCommunities();
  }, []);

  async function handleAction(communityId: string, action: "join" | "leave") {
    setActionLoading(communityId);
    try {
      const res = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityId, action }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to ${action}`);
      }

      // Update local state
      setCommunities((prev) =>
        prev.map((c) => {
          if (c.id !== communityId) return c;
          return {
            ...c,
            is_member: action === "join",
            member_count:
              action === "join"
                ? c.member_count + 1
                : Math.max(c.member_count - 1, 0),
          };
        })
      );

      toast.success(
        action === "join"
          ? "Joined community!"
          : "Left community"
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading communities...</p>
        </CardContent>
      </Card>
    );
  }

  if (communities.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 flex flex-col items-center justify-center gap-3">
          <MessagesSquare className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            No communities available yet. Check back soon!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group by type
  const grouped: GroupedCommunities = {};
  for (const c of communities) {
    const type = c.community_type || "other";
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(c);
  }

  // Sort groups: skill, location, industry, then others
  const typeOrder = ["skill", "location", "industry"];
  const sortedTypes = Object.keys(grouped).sort((a, b) => {
    const ai = typeOrder.indexOf(a);
    const bi = typeOrder.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <div className="space-y-8">
      {sortedTypes.map((type) => {
        const config = getTypeConfig(type);
        const TypeIcon = config.icon;

        return (
          <div key={type}>
            <div className="flex items-center gap-2 mb-4">
              <TypeIcon className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {config.label} Communities
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {grouped[type].map((community) => {
                const isActioning = actionLoading === community.id;

                return (
                  <Card
                    key={community.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-5 flex flex-col h-full">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Link
                          href={`/dashboard/communities/${community.slug}`}
                          className="hover:underline"
                        >
                          <h3 className="font-semibold text-base leading-tight">
                            {community.name}
                          </h3>
                        </Link>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] flex-shrink-0", config.color)}
                        >
                          {config.label}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
                        {community.description || "No description."}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          {community.member_count}{" "}
                          {community.member_count === 1 ? "member" : "members"}
                        </span>

                        <Button
                          variant={community.is_member ? "outline" : "default"}
                          size="sm"
                          disabled={isActioning}
                          onClick={(e) => {
                            e.preventDefault();
                            handleAction(
                              community.id,
                              community.is_member ? "leave" : "join"
                            );
                          }}
                        >
                          {isActioning ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : community.is_member ? (
                            "Leave"
                          ) : (
                            "Join"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
