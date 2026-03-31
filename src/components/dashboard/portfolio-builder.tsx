"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FolderOpen,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PortfolioItem {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  url: string | null;
  image_url: string | null;
  item_type: string;
  sort_order: number;
  created_at: string;
}

const ITEM_TYPES = [
  { value: "project", label: "Project" },
  { value: "case_study", label: "Case Study" },
  { value: "article", label: "Article" },
  { value: "design", label: "Design" },
];

const EMPTY_FORM = {
  title: "",
  url: "",
  description: "",
  image_url: "",
  item_type: "project",
};

interface PortfolioClientProps {
  userId: string;
}

export default function PortfolioClient({ userId }: PortfolioClientProps) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [enhancing, setEnhancing] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio");
      const data = await res.json();
      if (res.ok) {
        setItems(data.items || []);
      } else {
        toast.error("Failed to load portfolio", { description: data.error });
      }
    } catch {
      toast.error("Failed to load portfolio");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowDialog(true);
  }

  function openEdit(item: PortfolioItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      url: item.url || "",
      description: item.description || "",
      image_url: item.image_url || "",
      item_type: item.item_type || "project",
    });
    setShowDialog(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);

    try {
      if (editingId) {
        const res = await fetch(`/api/portfolio/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (res.ok) {
          setItems(items.map((i) => (i.id === editingId ? data.item : i)));
          toast.success("Project updated");
          setShowDialog(false);
        } else {
          toast.error("Failed to update", { description: data.error });
        }
      } else {
        const res = await fetch("/api/portfolio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (res.ok) {
          setItems([...items, data.item]);
          toast.success("Project added");
          setShowDialog(false);
        } else {
          toast.error("Failed to add", { description: data.error });
        }
      }
    } catch {
      toast.error("Something went wrong");
    }

    setSaving(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems(items.filter((i) => i.id !== id));
        toast.success("Project removed");
      } else {
        const data = await res.json();
        toast.error("Failed to delete", { description: data.error });
      }
    } catch {
      toast.error("Failed to delete");
    }
    setDeletingId(null);
  }

  async function handleEnhance() {
    if (!form.description.trim() || !form.title.trim()) {
      toast.error("Enter a title and description first");
      return;
    }
    setEnhancing(true);
    try {
      const res = await fetch("/api/ai/enhance-portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          url: form.url || undefined,
          description: form.description,
        }),
      });
      const data = await res.json();
      if (res.ok && data.description) {
        setForm({ ...form, description: data.description });
        toast.success("Description enhanced");
      } else {
        toast.error("Failed to enhance", { description: data.error });
      }
    } catch {
      toast.error("Enhancement failed");
    }
    setEnhancing(false);
  }

  const typeLabel = (type: string) =>
    ITEM_TYPES.find((t) => t.value === type)?.label || type;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-sm text-muted-foreground">
            Showcase your best work to stand out to employers.
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" /> Add Project
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No portfolio items yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Add projects, case studies, articles, or designs to showcase your
              skills and experience to potential employers.
            </p>
            <Button onClick={openAdd} variant="outline">
              <Plus className="h-4 w-4 mr-1" /> Add Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              {item.image_url && (
                <div className="h-40 overflow-hidden bg-muted">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">
                      {item.title}
                    </CardTitle>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {typeLabel(item.item_type)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => openEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                    {item.description}
                  </p>
                )}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View project
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Project" : "Add Project"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="portfolio-title">Title *</Label>
              <Input
                id="portfolio-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="My Awesome Project"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolio-type">Type</Label>
              <Select
                value={form.item_type}
                onValueChange={(val) => setForm({ ...form, item_type: val })}
              >
                <SelectTrigger id="portfolio-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ITEM_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolio-url">URL</Label>
              <Input
                id="portfolio-url"
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://example.com/project"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolio-image">Image URL</Label>
              <Input
                id="portfolio-image"
                type="url"
                value={form.image_url}
                onChange={(e) =>
                  setForm({ ...form, image_url: e.target.value })
                }
                placeholder="https://example.com/screenshot.png"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="portfolio-desc">Description</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleEnhance}
                  disabled={enhancing || !form.description.trim() || !form.title.trim()}
                  className="h-7 text-xs gap-1"
                >
                  {enhancing ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  {enhancing ? "Enhancing..." : "AI Enhance"}
                </Button>
              </div>
              <Textarea
                id="portfolio-desc"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                placeholder="Describe what you built, the technologies used, and the impact..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.title.trim() || saving}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Project"
                  : "Add Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
