"use client";

import { useState } from "react";
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
import { generateFlashcards } from "@/app/actions/ai-actions";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GenerateContentDialogProps {
  deckId: string;
}

export function GenerateContentDialog({ deckId }: GenerateContentDialogProps) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await generateFlashcards(deckId, topic, 5);

    if (result.success) {
      toast.success(`Successfully generated ${result.count} cards!`);
      setOpen(false);
      setTopic("");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to generate cards");
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          AI Generate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Flashcards with AI</DialogTitle>
          <DialogDescription>
            Enter a topic and we'll automatically generate flashcards and MCQs for you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., Photosynthesis, World War II, Spanish Verbs"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter className="pt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Generating..." : "Generate Cards"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
