"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Play, Pause, RotateCcw, Coffee, Brain, Timer, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

type TimerMode = "work" | "shortBreak" | "longBreak" | "custom";

const DEFAULT_SETTINGS = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  custom: 25 * 60,
};

export function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.work);
  const [isActive, setIsActive] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("25");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Optional: Play sound here
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === "custom") {
       setTimeLeft(parseInt(customMinutes) * 60);
    } else {
       setTimeLeft(DEFAULT_SETTINGS[mode]);
    }
  };

  const changeMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    if (newMode === "custom") {
        setTimeLeft(parseInt(customMinutes) * 60);
    } else {
        setTimeLeft(DEFAULT_SETTINGS[newMode]);
    }
  };
  
  const handleCustomTimeSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const mins = parseInt(customMinutes);
      if (!isNaN(mins) && mins > 0) {
          setTimeLeft(mins * 60);
          setMode("custom");
          setIsActive(false);
          setIsDialogOpen(false);
      }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <Card className="w-full shadow-md dark:shadow-[0_8px_30px_rgb(255,255,255,0.1)] border-0 bg-transparent sm:bg-card/50 dark:bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            <span>Focus Timer</span>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Settings2 className="h-4 w-4" />
                  </Button>
              </DialogTrigger>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>Set Custom Time</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCustomTimeSubmit} className="space-y-4">
                      <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium">Duration (minutes)</label>
                          <Input 
                            type="number" 
                            min="1" 
                            value={customMinutes} 
                            onChange={(e) => setCustomMinutes(e.target.value)} 
                          />
                      </div>
                      <DialogFooter>
                          <Button type="submit">Set Timer</Button>
                      </DialogFooter>
                  </form>
              </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-6 bg-muted/50 p-1 rounded-xl">
          <Button
            variant={mode === "work" ? "default" : "ghost"}
            size="sm"
            onClick={() => changeMode("work")}
            className="flex-1 rounded-lg shadow-sm"
          >
            <Brain className="h-3 w-3 mr-1" /> Work
          </Button>
          <Button
            variant={mode === "shortBreak" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => changeMode("shortBreak")}
            className={cn("flex-1 rounded-lg", mode === "shortBreak" && "shadow-sm bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100")}
          >
            <Coffee className="h-3 w-3 mr-1" /> Short
          </Button>
          <Button
            variant={mode === "longBreak" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => changeMode("longBreak")}
            className={cn("flex-1 rounded-lg", mode === "longBreak" && "shadow-sm bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100")}
          >
            <Coffee className="h-3 w-3 mr-1" /> Long
          </Button>
        </div>

        <div className="text-center mb-8 relative py-4">
          <div className="text-5xl sm:text-6xl font-mono font-bold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent transition-all">
            {formatTime(timeLeft)}
          </div>
          <p className="text-sm font-medium text-muted-foreground mt-2 uppercase tracking-widest text-[0.65rem]">
            {mode === "work" ? "Focus Session" : mode === "custom" ? "Custom Timer" : "Break Time"}
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            onClick={toggleTimer}
            variant={isActive ? "secondary" : "default"}
            className={cn(
                "w-32 h-12 rounded-full text-base font-medium shadow-lg transition-all hover:scale-105 active:scale-95",
                isActive ? "bg-red-100 text-red-900 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-100" : ""
            )}
          >
            {isActive ? (
              <>
                <Pause className="h-4 w-4 mr-2" /> Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2 ml-1" /> Start
              </>
            )}
          </Button>
          <Button 
            onClick={resetTimer} 
            variant="outline" 
            size="icon"
            className="h-12 w-12 rounded-full shadow-sm hover:bg-muted"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
