"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

interface ResultData {
  score: number;
  total: number;
  answers: Record<number, string>;
  questions: any[];
}

import { use } from "react";

export default function ResultPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const [data, setData] = useState<ResultData | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`test_result_${sessionId}`);
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, [sessionId]);

  if (!data) return <div className="p-8 text-center">Loading results...</div>;

  const percentage = Math.round((data.score / data.total) * 100);

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Card className="text-center py-8 mb-8">
        <CardHeader>
          <CardTitle className="text-3xl">Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center mb-6">
            <div className="relative h-40 w-40 flex items-center justify-center rounded-full border-8 border-primary/20">
              <div className="text-center">
                <span className="text-4xl font-bold">{percentage}%</span>
                <p className="text-muted-foreground text-sm">Score</p>
              </div>
            </div>
          </div>
          <p className="text-xl mb-6">
            You scored <span className="font-bold">{data.score}</span> out of <span className="font-bold">{data.total}</span>
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/tests">
              <Button variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" /> Take Another Test
              </Button>
            </Link>
            <Link href="/">
              <Button>
                <Home className="mr-2 h-4 w-4" /> Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-bold mb-4">Detailed Review</h2>
      <div className="space-y-4">
        {data.questions.map((q, idx) => {
          const userAnswer = data.answers[idx];
          const isMcq = q.cardType === "mcq" || (q.options && q.options.length > 0);
          
          const isCorrect = isMcq
            ? userAnswer === q.options?.[q.correctAnswerIndex || 0]
            : userAnswer?.trim().toLowerCase() === q.answer.trim().toLowerCase();

          return (
            <Card key={idx} className={`border-l-4 ${isCorrect ? "border-l-green-500" : "border-l-red-500"}`}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {isCorrect ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="font-medium">{q.question}</p>
                    <div className="text-sm">
                      <span className="text-muted-foreground block mb-1">Your Answer:</span>
                      <p className={isCorrect ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {userAnswer || "(No Answer)"}
                      </p>
                    </div>
                    {!isCorrect && (
                      <div className="text-sm bg-muted p-2 rounded">
                        <span className="text-muted-foreground block mb-1">Correct Answer:</span>
                        <p className="font-medium">
                          {isMcq ? q.options?.[q.correctAnswerIndex || 0] : q.answer}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
