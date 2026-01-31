"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { submitTestResult } from "@/app/actions/test-actions";
import { useRouter } from "next/navigation";
import { Timer, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

interface Question {
  _id: string;
  question: string;
  answer: string;
  cardType: "flashcard" | "mcq";
  options?: string[];
  correctAnswerIndex?: number;
}

import { use } from "react";

export default function TestPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({}); 
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20 * 60); 
  const router = useRouter();

  useEffect(() => {
    // Load questions from storage
    const stored = sessionStorage.getItem(`test_questions_${sessionId}`);
    if (stored) {
      setQuestions(JSON.parse(stored));
    }
    setLoading(false);

    // Timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // Auto submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionId]);

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: value,
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    let score = 0;

    questions.forEach((q, idx) => {
      const userAnswer = answers[idx];
      if (!userAnswer) return;

      if (q.cardType === "mcq" || (q.options && q.options.length > 0)) {
        if (q.options && q.options[q.correctAnswerIndex || 0] === userAnswer) {
          score++;
        }
      } else {
        if (userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase()) {
          score++;
        }
      }
    });

    const result = await submitTestResult(sessionId, score, questions.length);
    
    if (result.success) {
      // Store result summary for result page
      sessionStorage.setItem(`test_result_${sessionId}`, JSON.stringify({
        score,
        total: questions.length,
        answers,
        questions
      }));
      router.push(`/test/result/${sessionId}`);
    } else {
      alert("Failed to submit test");
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) return <div className="p-8 text-center">Loading test...</div>;
  if (questions.length === 0) return <div className="p-8 text-center">No questions found for this test session.</div>;

  const currentQuestion = questions[currentIndex];
  const progress = ((Object.keys(answers).length) / questions.length) * 100;

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mock Test</h1>
          <p className="text-muted-foreground">Question {currentIndex + 1} of {questions.length}</p>
        </div>
        <div className="flex items-center gap-2 text-xl font-mono font-bold bg-muted px-4 py-2 rounded-md">
           <Timer className="h-5 w-5" />
           {formatTime(timeLeft)}
        </div>
      </div>

      <Progress value={progress} className="h-2 mb-8" />

      <Card className="min-h-[400px] flex flex-col">
        <CardHeader>
          <CardTitle className="text-xl">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          {(currentQuestion.cardType === "mcq" || (currentQuestion.options && currentQuestion.options.length > 0)) ? (
             <RadioGroup 
                value={answers[currentIndex] || ""} 
                onValueChange={handleAnswer} 
                className="space-y-4 pt-4"
             >
               {currentQuestion.options?.map((opt, idx) => (
                 <div key={idx} className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-accent cursor-pointer">
                   <RadioGroupItem value={opt} id={`opt-${idx}`} />
                   <Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer">{opt}</Label>
                 </div>
               ))}
             </RadioGroup>
          ) : (
            <div className="space-y-4 pt-4">
              <Label>Your Answer:</Label>
              <textarea 
                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                placeholder="Type your answer here..."
                value={answers[currentIndex] || ""}
                onChange={(e) => handleAnswer(e.target.value)}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button 
            variant="outline" 
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>

          {currentIndex === questions.length - 1 ? (
             <Button onClick={handleSubmit} disabled={submitting}>
               {submitting ? "Submitting..." : "Submit Test"}
               <CheckCircle2 className="ml-2 h-4 w-4" />
             </Button>
          ) : (
            <Button 
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <div className="mt-8 flex justify-center gap-2 flex-wrap">
        {questions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-8 h-8 rounded-full text-xs font-medium border
              ${currentIndex === idx ? "ring-2 ring-primary border-primary" : ""}
              ${answers[idx] ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}
            `}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
