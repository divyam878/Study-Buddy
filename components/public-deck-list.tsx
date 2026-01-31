"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Copy, User } from "lucide-react";
import { cloneDeck } from "@/app/actions/marketplace-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; 

interface Deck {
  _id: string;
  title: string;
  description?: string;
  tags: string[];
  cardCount: number;
  authorName: string;
  createdAt: string;
}

interface PublicDeckListProps {
  initialDecks: Deck[];
}

export function PublicDeckList({ initialDecks }: PublicDeckListProps) {
  const [cloningId, setCloningId] = useState<string | null>(null);
  const router = useRouter();

  const handleClone = async (deckId: string) => {
    setCloningId(deckId);
    const result = await cloneDeck(deckId);
    
    if (result.success) {
      alert("Deck cloned successfully! Redirecting you to your decks.");
      router.push("/decks");
    } else {
      alert("Failed to clone deck.");
    }
    
    setCloningId(null);
  };

  if (initialDecks.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No decks found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search terms
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {initialDecks.map((deck) => (
        <Card key={deck._id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="line-clamp-1">{deck.title}</CardTitle>
            </div>
            {deck.description && (
              <CardDescription className="line-clamp-2">
                {deck.description}
              </CardDescription>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <User className="h-3 w-3" />
              <span>{deck.authorName}</span>
            </div>
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
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => handleClone(deck._id)}
              disabled={cloningId === deck._id}
            >
              <Copy className="mr-2 h-4 w-4" />
              {cloningId === deck._id ? "Cloning..." : "Clone to My Decks"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
