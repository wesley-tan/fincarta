"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizPanelProps {
  text: string;
  title: string;
}

export default function QuizPanel({ text, title }: QuizPanelProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 2000), title }),
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error("Failed to fetch quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    setShowResult(true);
    
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizComplete(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-muted-foreground">Generating quiz questions...</span>
      </div>
    );
  }

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-12 space-y-6"
      >
        <Trophy className="w-24 h-24 mx-auto text-yellow-500" />
        <h2 className="text-3xl font-bold">Quiz Complete! 🎉</h2>
        <div className="space-y-2">
          <p className="text-5xl font-bold text-blue-600">{percentage}%</p>
          <p className="text-xl text-muted-foreground">
            You got {score} out of {questions.length} correct!
          </p>
        </div>
        <Button onClick={handleRestart} size="lg" className="encarta-button text-white">
          Try Again
        </Button>
      </motion.div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>Score: {score}/{questions.length}</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
          >
            <h3 className="text-xl font-bold mb-6">{question.question}</h3>

            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === question.correctAnswer;
                const showFeedback = showResult;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    className={cn(
                      "w-full p-4 text-left rounded-lg border-2 transition-all",
                      "hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950",
                      isSelected && !showFeedback && "border-blue-600 bg-blue-50 dark:bg-blue-950",
                      showFeedback && isCorrect && "border-green-600 bg-green-50 dark:bg-green-950",
                      showFeedback && isSelected && !isCorrect && "border-red-600 bg-red-50 dark:bg-red-950",
                      showFeedback && "cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex-1">{option}</span>
                      {showFeedback && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                      {showFeedback && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "mt-6 p-4 rounded-lg",
                  selectedAnswer === question.correctAnswer
                    ? "bg-green-50 dark:bg-green-950 border border-green-200"
                    : "bg-red-50 dark:bg-red-950 border border-red-200"
                )}
              >
                <p className="font-semibold mb-2">
                  {selectedAnswer === question.correctAnswer ? "✅ Correct!" : "❌ Incorrect"}
                </p>
                <p className="text-sm text-muted-foreground">{question.explanation}</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        {!showResult ? (
          <Button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="encarta-button text-white"
            size="lg"
          >
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNext} className="encarta-button text-white" size="lg">
            {currentQuestion < questions.length - 1 ? "Next Question" : "View Results"}
          </Button>
        )}
      </div>
    </div>
  );
}