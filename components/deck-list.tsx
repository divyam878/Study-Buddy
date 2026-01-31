"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Trash2 } from "lucide-react";
import { deleteDeck } from "@/app/actions/deck-actions";
import { useRouter } from "next/navigation";

interface Deck {
  _id: string;
  title: string;
  description?: string;
  tags: string[];
  cardCount: number;
  createdAt: string;
}

interface DeckListProps {
  initialDecks: Deck[];
  initialPagination?: {
    page: number;
    total: number;
    totalPages: number;
  };
}

export function DeckList({ initialDecks }: DeckListProps) {
  const [decks, setDecks] = useState(initialDecks);
  const router = useRouter();

  const handleDelete = async (deckId: string) => {
    if (!confirm("Are you sure you want to delete this deck?")) return;

    const result = await deleteDeck(deckId);
    if (result.success) {
      setDecks(decks.filter((d) => d._id !== deckId));
    }
  };

  if (decks.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No decks yet</h3>
        <p className="text-muted-foreground">
          Create your first deck to start learning
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {decks.map((deck) => (
        <Card key={deck._id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="line-clamp-1">{deck.title}</CardTitle>
            {deck.description && (
              <CardDescription className="line-clamp-2">
                {deck.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <BookOpen className="h-4 w-4" />
              <span>{deck.cardCount} cards</span>
            </div>
            {deck.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {deck.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
                {deck.tags.length > 3 && (
                  <Badge variant="secondary">+{deck.tags.length - 3}</Badge>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              asChild
              className="flex-1"
              onClick={() => router.push(`/decks/${deck._id}`)}
            >
              <Link href={`/decks/${deck._id}`}>View Deck</Link>
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleDelete(deck._id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
