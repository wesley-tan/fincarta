"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, X, Trophy, RefreshCw } from "lucide-react";
import CDRomLoader from "@/components/CDRomLoader";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

const STEP_INFO: Record<string, { title: string; topic: string }> = {
  "step-0": { title: "Budget & Cash Flow", topic: "budgeting and cash flow management" },
  "step-1": { title: "Build Emergency Fund", topic: "emergency fund and savings" },
  "step-2": { title: "Eliminate High-Interest Debt", topic: "debt payoff strategies" },
  "step-3": { title: "Employer 401(k) Match", topic: "401k employer matching" },
  "step-4": { title: "Individual Retirement Accounts", topic: "IRA retirement accounts" },
  "step-5": { title: "Insurance & Risk Protection", topic: "insurance and risk management" },
  "step-6": { title: "Maximize Retirement Savings", topic: "retirement savings strategies" },
  "step-7": { title: "Tax-Advantaged Accounts", topic: "HSA and 529 plans" },
  "step-8": { title: "Major Financial Goals", topic: "mortgages and home buying" },
  "step-9": { title: "Estate Planning Basics", topic: "estate planning and wills" },
  "step-advanced": { title: "Advanced Tax Optimization", topic: "backdoor Roth IRA and tax strategies" },
};

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const stepId = params.stepId as string;

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);

  const stepInfo = STEP_INFO[stepId];

  useEffect(() => {
    if (stepInfo) {
      generateQuiz();
    }
  }, [stepId]);

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: `Generate 5 multiple choice questions about ${stepInfo.topic} for personal finance education. Include questions about key concepts, best practices, and common mistakes to avoid.`,
          numQuestions: 5, 
          title: stepInfo.title
        }),
      });

      if (!response.ok) throw new Error("Failed to generate quiz");

      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error("Quiz generation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    setShowResult(true);
    setAnswers([...answers, isCorrect]);
    
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    setQuizComplete(true);
    
    // Save progress
    const progress = JSON.parse(localStorage.getItem("finance-roadmap-progress") || "{}");
    const stars = Math.ceil((score / questions.length) * 3);
    
    progress[stepId] = {
      completed: score === questions.length, // Perfect score required (3/3)
      stars: stars,
      articlesRead: progress[stepId]?.articlesRead || [],
    };
    
    localStorage.setItem("finance-roadmap-progress", JSON.stringify(progress));
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setQuizComplete(false);
    generateQuiz();
  };

  if (loading) {
    return (
      <div className="min-h-screen encarta-bg flex items-center justify-center p-4">
        <div className="encarta-window max-w-2xl w-full">
          <CDRomLoader />
        </div>
      </div>
    );
  }

  if (!stepInfo || questions.length === 0) {
    return (
      <div className="min-h-screen encarta-bg flex items-center justify-center p-4">
        <div className="encarta-window max-w-md">
          <div className="encarta-window-titlebar">
            <span className="encarta-window-title">⚠️ Error</span>
          </div>
          <div className="p-6 bg-white text-center">
            <p className="text-sm mb-4">Unable to load quiz.</p>
            <button onClick={() => router.push("/roadmap")} className="encarta-button">
              Return to Roadmap
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen encarta-bg relative overflow-hidden p-4">
      <div className="container mx-auto max-w-3xl py-8">
        {/* Header */}
        <div className="encarta-window mb-6">
          <div className="encarta-window-titlebar">
            <span className="encarta-window-title">🎯 Quiz: {stepInfo.title}</span>
          </div>
          <div className="p-4 bg-white">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push("/roadmap")}
                className="encarta-button text-xs flex items-center gap-2"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to Roadmap
              </button>
              
              {!quizComplete && (
                <div className="text-sm font-bold">
                  Question {currentQuestion + 1} / {questions.length}
                </div>
              )}
              
              <div className="text-sm font-bold">
                Score: {score} / {questions.length}
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!quizComplete ? (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="encarta-window"
            >
              <div className="encarta-window-titlebar">
                <span className="encarta-window-title">Question {currentQuestion + 1}</span>
              </div>
              
              <div className="p-6 bg-white">
                {/* Question */}
                <div className="mb-6">
                  <p className="text-base font-bold mb-4">
                    {questions[currentQuestion].question}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-3 mb-6">
                  {questions[currentQuestion].options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === questions[currentQuestion].correctAnswer;
                    const showCorrectAnswer = showResult && isCorrect;
                    const showWrongAnswer = showResult && isSelected && !isCorrect;

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showResult}
                        className={`w-full p-4 text-left border-2 transition-all ${
                          showCorrectAnswer
                            ? "bg-green-100 border-green-600"
                            : showWrongAnswer
                            ? "bg-red-100 border-red-600"
                            : isSelected
                            ? "bg-blue-100 border-blue-600"
                            : "bg-white border-gray-400 hover:border-blue-400"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 flex items-center justify-center border-2 ${
                              showCorrectAnswer
                                ? "bg-green-500 border-green-700"
                                : showWrongAnswer
                                ? "bg-red-500 border-red-700"
                                : isSelected
                                ? "bg-blue-500 border-blue-700"
                                : "bg-white border-gray-400"
                            }`}
                          >
                            {showCorrectAnswer && <Check className="w-5 h-5 text-white" />}
                            {showWrongAnswer && <X className="w-5 h-5 text-white" />}
                            {!showResult && (
                              <span className="text-xs font-bold">{String.fromCharCode(65 + index)}</span>
                            )}
                          </div>
                          <span className="text-sm">{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {showResult && questions[currentQuestion].explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-blue-50 border-2 border-blue-300"
                  >
                    <p className="text-xs font-bold mb-2">💡 Explanation:</p>
                    <p className="text-xs text-gray-700">{questions[currentQuestion].explanation}</p>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                  {!showResult ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                      className="encarta-button"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button onClick={handleNextQuestion} className="encarta-button">
                      {currentQuestion < questions.length - 1 ? "Next Question →" : "See Results"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="encarta-window"
            >
              <div className="encarta-window-titlebar">
                <span className="encarta-window-title">🏆 Quiz Complete!</span>
              </div>
              
              <div className="p-8 bg-white text-center">
                <Trophy className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                
                <h2 className="text-2xl font-bold mb-2">
                  {score === questions.length
                    ? "Perfect! 🎯"
                    : score >= Math.ceil(questions.length * 0.67)
                    ? "Good Job!"
                    : "Keep Learning!"}
                </h2>
                
                <p className="text-lg mb-6">
                  You scored <span className="font-bold text-blue-600">{score}</span> out of{" "}
                  <span className="font-bold">{questions.length}</span>
                </p>

                {/* Stars */}
                <div className="flex justify-center gap-2 mb-6">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-12 h-12 flex items-center justify-center ${
                        i < Math.ceil((score / questions.length) * 3)
                          ? "text-yellow-500"
                          : "text-gray-300"
                      }`}
                    >
                      ⭐
                    </div>
                  ))}
                </div>

                {/* Pass/Fail Message */}
                {score === questions.length ? (
                  <div className="mb-6 p-4 bg-green-50 border-2 border-green-500">
                    <p className="text-sm font-bold text-green-800">
                      ✅ Perfect Score! You've unlocked the next step.
                    </p>
                  </div>
                ) : score >= Math.ceil(questions.length * 0.67) ? (
                  <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-500">
                    <p className="text-sm font-bold text-blue-800">
                      📖 Good effort! Score 3/3 to unlock the next step.
                    </p>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-500">
                    <p className="text-sm font-bold text-yellow-800">
                      📚 Review the material and try again to unlock the next step.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => router.push("/roadmap")}
                    className="encarta-button"
                  >
                    Return to Roadmap
                  </button>
                  <button
                    onClick={handleRetry}
                    className="encarta-button flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry Quiz
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
