"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { startStudySession, submitCardReview, endStudySession } from "@/app/actions/study-actions";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";

interface Flashcard {
  _id: string;
  question: string;
  answer: string;
  cardType: "flashcard" | "mcq";
  options?: string[];
  correctAnswerIndex?: number;
  deckId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
}

interface StudyInterfaceProps {
  deck: {
    _id: string;
    title: string;
  };
  initialCards: Flashcard[];
}

export function StudyInterface({ deck, initialCards }: StudyInterfaceProps) {
  const [cards, setCards] = useState(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
  const router = useRouter();

  useEffect(() => {
    const initSession = async () => {
      const result = await startStudySession(deck._id);
      if (result.success && result.sessionId) {
        setSessionId(result.sessionId);
      }
    };
    initSession();
  }, [deck._id]);

  // Sync state with props when router.refresh() updates initialCards
  useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isFlipped) {
        e.preventDefault();
        setIsFlipped(true);
      } else if (isFlipped && ["Digit0", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5"].includes(e.code)) {
        const quality = parseInt(e.code.replace("Digit", ""));
        handleRating(quality);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isFlipped, currentIndex]);

  const handleRating = async (quality: number) => {
    if (!sessionId || !cards[currentIndex]) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const wasCorrect = quality >= 3;

    await submitCardReview(
      cards[currentIndex]._id,
      sessionId,
      quality,
      timeSpent
    );

    setStats((prev) => ({
      correct: prev.correct + (wasCorrect ? 1 : 0),
      incorrect: prev.incorrect + (wasCorrect ? 0 : 1),
    }));

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setStartTime(Date.now());
    } else {
      await endStudySession(sessionId);
      router.push(`/decks/${deck._id}`);
    }
  };

  if (cards.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6 text-center">
          <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">All caught up!</h2>
          <p className="text-muted-foreground mb-6">
            No cards are due for review in this deck right now.
          </p>
          <Button onClick={() => router.push(`/decks/${deck._id}`)}>
            Back to Deck
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  const handleMcqSelection = (index: number) => {
    if (isFlipped) return; // Prevent changing after reveal
    
    // Check if correct
    const card = cards[currentIndex];
    const isCorrect = index === card.correctAnswerIndex;
    
    // Auto-rate based on correctness
    // If correct: Quality 3 (Good)
    // If incorrect: Quality 1 (Hard/Wrong)
    handleRating(isCorrect ? 3 : 1);
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const renderCardContent = () => {
    const card = cards[currentIndex];

    // Back of card (Answer) or Front if it's text-only flashcard
    if (isFlipped) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 max-w-lg w-full">
          <p className="text-3xl font-serif leading-relaxed text-gray-900">{card.answer}</p>
          {card.cardType === "mcq" && (
             <div className="w-full space-y-2 mt-4">
               {card.options?.map((option, idx) => (
                 <div 
                   key={idx}
                   className={cn(
                     "p-3 rounded-lg border text-left w-full transition-all font-medium",
                     idx === card.correctAnswerIndex 
                       ? "bg-green-500/10 border-green-500 text-green-700 dark:text-green-300" // Correct
                       : "border-transparent opacity-60 grayscale hover:opacity-100" // Others faded
                   )}
                 >
                   {option}
                 </div>
               ))}
             </div>
          )}
        </div>
      );
    }

    // Front of card (Question)
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-lg w-full">
        <p className="text-3xl font-serif font-medium leading-relaxed text-gray-900">{card.question}</p>
        
        {card.cardType === "mcq" && (
          <div className="w-full grid gap-3 mt-4">
            {card.options?.map((option, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card flip
                  handleMcqSelection(idx);
                }}
                className="p-4 rounded-xl border border-black/5 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-sm hover:border-black/20 dark:hover:border-white/20 hover:scale-[1.01] hover:bg-white/80 dark:hover:bg-black/40 transition-all text-left w-full shadow-sm font-medium"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{deck.title}</h1>
              <p className="text-sm text-muted-foreground">
                Card {currentIndex + 1} of {cards.length}
              </p>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{stats.correct} correct</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span>{stats.incorrect} incorrect</span>
              </div>
            </div>
          </div>

          <Progress value={progress} className="h-2" />

          <Card
            className={cn(
              "min-h-[400px] cursor-pointer transition-all duration-300 hover:scale-[1.02]",
              // Post-it Styling
              "border-0 shadow-lg dark:shadow-[0_8px_30px_rgb(255,255,255,0.1)] relative overflow-hidden bg-transparent", // White shadow in dark mode
              "before:absolute before:inset-0 before:bg-gradient-to-br before:from-yellow-100 before:to-yellow-50 dark:before:from-amber-300 dark:before:to-amber-500 before:-z-10", // Richer Mustard/Gold in dark mode to support black text
              isFlipped ? "rotate-1" : "-rotate-1", // Subtle tilt
              "after:absolute after:top-0 after:left-0 after:w-full after:h-8 after:bg-white/40 dark:after:bg-white/20 after:blur-xl" // Gloss effect
            )}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <CardHeader>
              <CardTitle className="text-center text-sm font-medium tracking-widest text-muted-foreground/50 uppercase">
                {isFlipped ? "Answer Side" : "Question Side"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-[250px]">
              {renderCardContent()}
            </CardContent>
            {!isFlipped && currentCard.cardType !== "mcq" && (
              <CardFooter className="justify-center">
                <p className="text-xs font-hand text-muted-foreground/60 animate-pulse">
                  (Click or Space to reveal)
                </p>
              </CardFooter>
            )}
          </Card>
          
          {/* Manual Navigation */}
          <div className="flex justify-between items-center px-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="text-muted-foreground hover:text-foreground"
            >
              &larr; Previous Card
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex === cards.length - 1}
              className="text-muted-foreground hover:text-foreground"
            >
              Next Card &rarr;
            </Button>
          </div>

          {isFlipped && (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                How well did you know this?
              </p>
              <div className="grid grid-cols-6 gap-2">
                {[
                  { value: 0, label: "Forgot", color: "destructive" },
                  { value: 1, label: "Hard", color: "destructive" },
                  { value: 2, label: "Difficult", color: "secondary" },
                  { value: 3, label: "Good", color: "secondary" },
                  { value: 4, label: "Easy", color: "default" },
                  { value: 5, label: "Perfect", color: "default" },
                ].map((rating) => (
                  <Button
                    key={rating.value}
                    variant={rating.color as "default" | "destructive" | "secondary"}
                    onClick={() => handleRating(rating.value)}
                    className="flex flex-col h-auto py-3"
                  >
                    <span className="text-2xl font-bold">{rating.value}</span>
                    <span className="text-xs">{rating.label}</span>
                  </Button>
                ))}
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Press 0-5 on your keyboard
              </p>
            </div>
          )}
        </div>
        
        <div className="hidden lg:block lg:col-span-1 space-y-6">
          <PomodoroTimer />
        </div>
      </div>
    </div>
  );
}
