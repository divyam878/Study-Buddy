"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, Trophy, ArrowRight } from "lucide-react";
import { startMockTest } from "@/app/actions/test-actions";

interface Deck {
  _id: string;
  title: string;
  description: string;
  cardCount: number;
}

interface TestDashboardProps {
  decks: Deck[];
}

export function TestDashboard({ decks }: TestDashboardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleStartTest = async (deckId: string) => {
    setLoading(deckId);
    const result = await startMockTest(deckId, 20); 
    
    if (result.success) {
      sessionStorage.setItem(`test_questions_${result.sessionId}`, JSON.stringify(result.questions));
      router.push(`/test/${result.sessionId}`);
    } else {
      alert("Failed to start test. Deck might be empty.");
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {decks.map((deck) => (
        <Card key={deck._id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>{deck.title}</CardTitle>
            <CardDescription>{deck.cardCount} cards available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span>~20 mins estimated</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Trophy className="h-4 w-4" />
              <span>20 Questions</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => handleStartTest(deck._id)}
              disabled={loading !== null || deck.cardCount === 0}
            >
              {loading === deck._id ? "Starting..." : "Start Mock Test"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
