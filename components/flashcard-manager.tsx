"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { CreateFlashcardDialog } from "@/components/create-flashcard-dialog";
import { GenerateContentDialog } from "@/components/generate-content-dialog";
import { deleteFlashcard } from "@/app/actions/flashcard-actions";

interface Flashcard {
  _id: string;
  question: string;
  answer: string;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
}

interface FlashcardManagerProps {
  deckId: string;
  initialFlashcards: Flashcard[];
}

export function FlashcardManager({
  deckId,
  initialFlashcards,
}: FlashcardManagerProps) {
  const [flashcards, setFlashcards] = useState(initialFlashcards);

  useEffect(() => {
    setFlashcards(initialFlashcards);
  }, [initialFlashcards]);

  const handleDelete = async (flashcardId: string) => {
    if (!confirm("Are you sure you want to delete this flashcard?")) return;

    const result = await deleteFlashcard(flashcardId);
    if (result.success) {
      setFlashcards(flashcards.filter((f) => f._id !== flashcardId));
    }
  };

  const calculateAccuracy = (card: Flashcard) => {
    const total = card.correctCount + card.incorrectCount;
    if (total === 0) return 0;
    return Math.round((card.correctCount / total) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Cards ({flashcards.length})</h2>
        <div className="flex gap-2">
          <GenerateContentDialog deckId={deckId} />
          <CreateFlashcardDialog deckId={deckId}>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Card
            </Button>
          </CreateFlashcardDialog>
        </div>
      </div>

      {flashcards.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              No flashcards in this deck yet
            </p>
            <CreateFlashcardDialog deckId={deckId}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create First Flashcard
              </Button>
            </CreateFlashcardDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {flashcards.map((card) => (
            <Card key={card._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base mb-2">
                      Q: {card.question}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      A: {card.answer}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(card._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {card.reviewCount > 0 && (
                <CardContent>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Reviews: {card.reviewCount}</span>
                    <span>Accuracy: {calculateAccuracy(card)}%</span>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
