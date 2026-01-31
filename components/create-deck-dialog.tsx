"use client";

import { useState, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createDeck } from "@/app/actions/deck-actions";
import { useRouter } from "next/navigation";
import { Globe, Lock } from "lucide-react";

interface CreateDeckDialogProps {
  children: ReactNode;
}

export function CreateDeckDialog({ children }: CreateDeckDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await createDeck({
      title,
      description,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      category: category || undefined,
      visibility: isPublic ? "public" : "private",
    });

    if (result.success) {
      setOpen(false);
      setTitle("");
      setDescription("");
      setTags("");
      setCategory("");
      setIsPublic(false);
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Deck</DialogTitle>
          <DialogDescription>
            Add a new flashcard deck to organize your learning
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Spanish Vocabulary"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What is this deck about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., Languages"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., beginner, verbs, daily"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="public-mode"
                checked={isPublic}
                onCheckedChange={setIsPublic}
                disabled={loading}
              />
              <Label htmlFor="public-mode" className="flex items-center gap-2 cursor-pointer">
                {isPublic ? (
                  <>
                    <Globe className="h-4 w-4 text-blue-500" />
                    Public (Visible to everyone)
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Private (Only you)
                  </>
                )}
              </Label>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Deck"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
