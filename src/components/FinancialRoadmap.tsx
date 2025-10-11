"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Lock, Star, BookOpen, Trophy, Sparkles, TrendingUp } from "lucide-react";

interface Step {
  id: string;
  level: number;
  title: string;
  description: string;
  topics: string[];
  quiz?: boolean;
  locked: boolean;
  completed: boolean;
  stars: number;
}

interface Recommendation {
  topic: string;
  reason: string;
  difficulty: string;
  relevance: string;
}

export default function FinancialRoadmap() {
  const router = useRouter();
  const [progress, setProgress] = useState<Record<string, { completed: boolean; stars: number; articlesRead: string[] }>>({});
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [userLevel, setUserLevel] = useState<string>("beginner");
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("finance-roadmap-progress");
    if (saved) {
      setProgress(JSON.parse(saved));
    }
  }, []);

  const steps: Step[] = [
    {
      id: "step-0",
      level: 0,
      title: "Budget & Set Goals",
      description: "Learn to track expenses and set realistic financial goals",
      topics: ["budgeting basics", "expense tracking", "financial goals", "reducing expenses"],
      quiz: true,
      locked: false,
      completed: progress["step-0"]?.completed || false,
      stars: progress["step-0"]?.stars || 0,
    },
    {
      id: "step-1",
      level: 1,
      title: "Emergency Fund",
      description: "Build 3-6 months of expenses for unexpected situations",
      topics: ["emergency fund", "savings account", "high-yield savings", "financial safety net"],
      quiz: true,
      locked: !progress["step-0"]?.completed,
      completed: progress["step-1"]?.completed || false,
      stars: progress["step-1"]?.stars || 0,
    },
    {
      id: "step-2",
      level: 2,
      title: "Employer Match",
      description: "Maximize free money from employer 401(k) matching",
      topics: ["401k matching", "employer benefits", "retirement contributions", "payroll deductions"],
      quiz: true,
      locked: !progress["step-1"]?.completed,
      completed: progress["step-2"]?.completed || false,
      stars: progress["step-2"]?.stars || 0,
    },
    {
      id: "step-3",
      level: 3,
      title: "Pay Down Debt",
      description: "Eliminate high-interest debt with avalanche or snowball method",
      topics: ["debt payoff strategies", "avalanche method", "snowball method", "interest rates", "credit card debt"],
      quiz: true,
      locked: !progress["step-2"]?.completed,
      completed: progress["step-3"]?.completed || false,
      stars: progress["step-3"]?.stars || 0,
    },
    {
      id: "step-4",
      level: 4,
      title: "IRA Contributions",
      description: "Contribute to Roth or Traditional IRA for retirement",
      topics: ["IRA accounts", "Roth IRA", "Traditional IRA", "retirement savings", "tax advantages"],
      quiz: true,
      locked: !progress["step-3"]?.completed,
      completed: progress["step-4"]?.completed || false,
      stars: progress["step-4"]?.stars || 0,
    },
    {
      id: "step-5",
      level: 5,
      title: "Max Out Retirement",
      description: "Save 15-20% of gross income for retirement",
      topics: ["retirement planning", "401k contributions", "compound interest", "retirement calculator"],
      quiz: true,
      locked: !progress["step-4"]?.completed,
      completed: progress["step-5"]?.completed || false,
      stars: progress["step-5"]?.stars || 0,
    },
    {
      id: "step-6",
      level: 6,
      title: "Other Financial Goals",
      description: "Save for home, education, early retirement, and giving",
      topics: ["HSA accounts", "529 plans", "home down payment", "investment strategies", "charitable giving"],
      quiz: true,
      locked: !progress["step-5"]?.completed,
      completed: progress["step-6"]?.completed || false,
      stars: progress["step-6"]?.stars || 0,
    },
    {
      id: "step-advanced",
      level: 7,
      title: "Advanced Strategies",
      description: "Backdoor Roth, mega backdoor, and optimization techniques",
      topics: ["backdoor Roth IRA", "mega backdoor Roth", "tax optimization", "estate planning"],
      quiz: true,
      locked: !progress["step-6"]?.completed,
      completed: progress["step-advanced"]?.completed || false,
      stars: progress["step-advanced"]?.stars || 0,
    },
  ];

  const completedSteps = steps.filter((s) => s.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  // Get current unlocked step
  const currentStep = steps.find((s) => !s.locked && !s.completed) || steps[steps.length - 1];

  const handleStepClick = (step: Step) => {
    if (step.locked) return;
    
    // Track article read
    trackArticleRead(step.topics[0]);
    
    // Navigate to search with the first topic
    router.push(`/?search=${encodeURIComponent(step.topics[0])}`);
  };

  const handleQuizClick = (step: Step, e: React.MouseEvent) => {
    e.stopPropagation();
    if (step.locked) return;
    
    router.push(`/roadmap/quiz/${step.id}`);
  };

  const trackArticleRead = (topic: string) => {
    const articlesRead = JSON.parse(localStorage.getItem("articles-read") || "[]");
    if (!articlesRead.includes(topic)) {
      articlesRead.push(topic);
      localStorage.setItem("articles-read", JSON.stringify(articlesRead));
    }
  };

  const getRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const articlesRead = JSON.parse(localStorage.getItem("articles-read") || "[]");
      const lastSearches = JSON.parse(localStorage.getItem("last-searches") || "[]");

      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStep: currentStep.id,
          progress,
          articlesRead,
          lastSearches: lastSearches.slice(0, 5),
        }),
      });

      if (!response.ok) throw new Error("Failed to get recommendations");

      const data = await response.json();
      setRecommendations(data.recommendations || []);
      setUserLevel(data.userLevel || "beginner");
      setShowRecommendations(true);
    } catch (error) {
      console.error("Recommendation error:", error);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleRecommendationClick = (topic: string) => {
    trackArticleRead(topic);
    
    // Track search
    const lastSearches = JSON.parse(localStorage.getItem("last-searches") || "[]");
    lastSearches.unshift(topic);
    localStorage.setItem("last-searches", JSON.stringify(lastSearches.slice(0, 20)));
    
    router.push(`/?search=${encodeURIComponent(topic)}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      {/* Progress Header */}
      <div className="encarta-window mb-8">
        <div className="encarta-window-titlebar">
          <span className="encarta-window-title">🗺️ Personal Finance Roadmap</span>
        </div>
        <div className="p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold mb-1">Your Financial Journey</h2>
              <p className="text-xs text-gray-600">
                Complete all {totalSteps} steps to master personal finance
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <span className="text-2xl font-bold">{completedSteps}/{totalSteps}</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-6 border-2 border-gray-800 bg-white relative mb-4">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-800">
              {Math.round(progressPercentage)}% COMPLETE
            </span>
          </div>

          {/* User Level Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold uppercase">
                Level: {userLevel}
              </span>
            </div>
            
            <button
              onClick={getRecommendations}
              disabled={loadingRecs}
              className="encarta-button text-xs flex items-center gap-2"
            >
              <Sparkles className="w-3 h-3" />
              {loadingRecs ? "Analyzing..." : "Get AI Recommendations"}
            </button>
          </div>
        </div>
      </div>

      {/* AI Recommendations Panel */}
      {showRecommendations && recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="encarta-window mb-8"
        >
          <div className="encarta-window-titlebar">
            <span className="encarta-window-title">✨ Personalized Recommendations</span>
            <button
              onClick={() => setShowRecommendations(false)}
              className="text-white hover:text-yellow-300 text-lg"
            >
              ×
            </button>
          </div>
          <div className="p-6 bg-white">
            <p className="text-xs text-gray-600 mb-4">
              Based on your progress, we recommend these articles:
            </p>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  onClick={() => handleRecommendationClick(rec.topic)}
                  className="p-4 border-2 border-blue-300 bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-blue-600 text-white font-bold text-xs">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm mb-1">{rec.topic}</h4>
                      <p className="text-xs text-gray-700 mb-2">{rec.reason}</p>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-white text-xs border border-blue-400">
                          {rec.difficulty}
                        </span>
                        <span className="text-xs text-gray-600">
                          📚 {rec.relevance}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Roadmap Steps */}
      <div className="space-y-6">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative ${index % 2 === 0 ? "ml-0 mr-8" : "ml-8 mr-0"}`}
          >
            <div
              className={`encarta-window cursor-pointer transition-all ${
                step.locked ? "opacity-50" : "hover:shadow-lg"
              }`}
              onClick={() => handleStepClick(step)}
            >
              <div className="encarta-window-titlebar">
                <span className="encarta-window-title">
                  STEP {step.level}: {step.title}
                </span>
                <div className="flex items-center gap-2 text-yellow-300 text-xs">
                  {[...Array(3)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3 h-3"
                      fill={i < step.stars ? "currentColor" : "none"}
                    />
                  ))}
                </div>
              </div>

              <div className="p-6 bg-white">
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div
                    className={`w-12 h-12 flex-shrink-0 flex items-center justify-center border-2 ${
                      step.completed
                        ? "bg-green-500 border-green-700"
                        : step.locked
                        ? "bg-gray-300 border-gray-500"
                        : "bg-blue-500 border-blue-700"
                    }`}
                  >
                    {step.completed ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : step.locked ? (
                      <Lock className="w-6 h-6 text-gray-600" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 mb-3">{step.description}</p>

                    {/* Topics */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {step.topics.map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs border border-blue-300"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        className="encarta-button text-xs"
                        disabled={step.locked}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStepClick(step);
                        }}
                      >
                        📖 Learn
                      </button>
                      {step.quiz && (
                        <button
                          className="encarta-button text-xs"
                          disabled={step.locked}
                          onClick={(e) => handleQuizClick(step, e)}
                        >
                          🎯 Take Quiz
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`absolute w-0.5 h-6 bg-gray-400 ${
                  index % 2 === 0 ? "left-6" : "right-6"
                } bottom-[-24px]`}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Completion Message */}
      {completedSteps === totalSteps && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="encarta-window mt-8"
        >
          <div className="encarta-window-titlebar">
            <span className="encarta-window-title">🏆 Congratulations!</span>
          </div>
          <div className="p-6 bg-white text-center">
            <Trophy className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Financial Mastery Achieved!</h3>
            <p className="text-sm text-gray-600">
              You've completed all steps in the personal finance roadmap.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}