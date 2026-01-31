import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDeck } from "@/app/actions/deck-actions";
import { getFlashcards } from "@/app/actions/flashcard-actions";
import { FlashcardManager } from "@/components/flashcard-manager";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play } from "lucide-react";
import Link from "next/link";

export default async function DeckDetailPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { deckId } = await params;

  if (!session) {
    redirect("/login");
  }

  const [deckResult, flashcardsResult] = await Promise.all([
    getDeck(deckId),
    getFlashcards(deckId, 1),
  ]);

  if (deckResult.error || flashcardsResult.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">
          {deckResult.error || flashcardsResult.error}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/decks">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{deckResult.deck.title}</h1>
            {deckResult.deck.description && (
              <p className="text-muted-foreground mt-1">
                {deckResult.deck.description}
              </p>
            )}
          </div>
        </div>
        <Button asChild>
          <Link href={`/study/${deckId}`}>
            <Play className="mr-2 h-4 w-4" />
            Start Studying
          </Link>
        </Button>
      </div>

      <FlashcardManager
        deckId={deckId}
        initialFlashcards={flashcardsResult.flashcards || []}
      />
    </div>
  );
}
