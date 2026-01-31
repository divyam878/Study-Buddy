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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createFlashcard } from "@/app/actions/flashcard-actions";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2 } from "lucide-react";

interface CreateFlashcardDialogProps {
  deckId: string;
  children: React.ReactNode;
}

export function CreateFlashcardDialog({ deckId, children }: CreateFlashcardDialogProps) {
  const [open, setOpen] = useState(false);
  const [cardType, setCardType] = useState<"flashcard" | "mcq">("flashcard");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  
  // MCQ state
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState<number>(0);
  
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    if (correctOption >= index && correctOption > 0) {
      setCorrectOption(correctOption - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await createFlashcard(deckId, {
      question,
      answer: cardType === "flashcard" ? answer : options[correctOption],
      cardType,
      options: cardType === "mcq" ? options.filter(o => o.trim() !== "") : [],
      correctAnswerIndex: cardType === "mcq" ? correctOption : undefined,
    });

    if (result.success) {
      setOpen(false);
      setQuestion("");
      setAnswer("");
      setCardType("flashcard");
      setOptions(["", "", "", ""]);
      setCorrectOption(0);
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Flashcard</DialogTitle>
          <DialogDescription>
            Create a standard flashcard or a multiple-choice question.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="space-y-2">
              <Label>Card Type</Label>
              <Select 
                value={cardType} 
                onValueChange={(v: "flashcard" | "mcq") => setCardType(v)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flashcard">Standard Flashcard</SelectItem>
                  <SelectItem value="mcq">Multiple Choice Question</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="question">{cardType === "mcq" ? "Question" : "Front (Question)"}</Label>
              <Textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
                disabled={loading}
                rows={2}
                placeholder={cardType === "mcq" ? "What is the capital of France?" : "What is the capital of France?"}
              />
            </div>

            {cardType === "flashcard" ? (
              <div className="space-y-2">
                <Label htmlFor="answer">Back (Answer)</Label>
                <Textarea
                  id="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                  disabled={loading}
                  rows={4}
                  placeholder="Paris"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <Label>Options</Label>
                <RadioGroup 
                  value={correctOption.toString()} 
                  onValueChange={(v) => setCorrectOption(parseInt(v))}
                >
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <RadioGroupItem value={index.toString()} id={`opt-${index}`} />
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        required
                        className="flex-1"
                      />
                      {options.length > 2 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </RadioGroup>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addOption}
                  className="w-full"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Option
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Select the radio button next to the correct answer.
                </p>
              </div>
            )}
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
              {loading ? "Adding..." : "Add Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
