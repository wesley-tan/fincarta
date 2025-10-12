"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Lock, Star, BookOpen, RefreshCw, Zap, Trophy, AlertCircle } from "lucide-react";

interface PersonalizedStep {
  id: string;
  step_order: number;
  title: string;
  description: string;
  priority: string;
  estimated_duration: string;
  topics: string[];
  custom_advice: string;
  why_this_matters: string;
  status: string;
  stars: number;
  has_quiz: boolean;
  completed_at: string | null;
}

interface UserProfile {
  age: number;
  income_range: string;
  primary_goal: string;
  risk_tolerance: string;
  difficulty_level: string;
}

export default function PersonalizedTrack({ userId }: { userId: string }) {
  const router = useRouter();
  const [steps, setSteps] = useState<PersonalizedStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
    loadPersonalizedSteps();
  }, [userId]);

  async function loadProfile() {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err: any) {
      console.error('Error loading profile:', err);
    }
  }

  async function loadPersonalizedSteps() {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('personalized_track_steps')
        .select('*')
        .eq('user_id', userId)
        .order('step_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setSteps(data);
      } else {
        // No steps yet, generate them
        await generateRoadmap();
      }
    } catch (err: any) {
      console.error('Error loading steps:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function generateRoadmap() {
    setGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/personalized-roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate roadmap');
      }

      // Reload steps after generation
      await loadPersonalizedSteps();
    } catch (err: any) {
      console.error('Failed to generate roadmap:', err);
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  const handleStepClick = (step: PersonalizedStep, topic: string) => {
    if (step.status === 'completed') return;
    
    // Track article read
    trackActivity('article_read', topic);
    
    // Navigate to search with the topic
    router.push(`/?search=${encodeURIComponent(topic)}`);
  };

  const handleQuizClick = (step: PersonalizedStep) => {
    if (step.status === 'completed') return;
    router.push(`/roadmap/personalized/quiz/${step.id}`);
  };

  async function trackActivity(activityType: string, relatedTopic?: string) {
    try {
      await supabase.from('user_activity_log').insert({
        user_id: userId,
        activity_type: activityType,
        related_topic: relatedTopic,
        metadata: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      console.error('Failed to track activity:', err);
    }
  }

  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const progressPercentage = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  // Loading State
  if (loading || generating) {
    return (
      <div className="encarta-window max-w-4xl mx-auto">
        <div className="encarta-window-titlebar">
          <span className="encarta-window-title">
            {generating ? '✨ Generating Your Personalized Path...' : '💾 Loading...'}
          </span>
        </div>
        <div className="p-8 bg-white text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-4"
          >
            <Zap className="w-12 h-12 text-purple-600" />
          </motion.div>
          <p className="text-sm text-gray-700 mb-2">
            {generating 
              ? 'Our AI is analyzing your profile and creating a custom roadmap just for you...'
              : 'Loading your personalized financial path...'
            }
          </p>
          <p className="text-xs text-gray-500">This takes about 5-10 seconds</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="encarta-window max-w-4xl mx-auto">
        <div className="encarta-window-titlebar">
          <span className="encarta-window-title">❌ Error</span>
        </div>
        <div className="p-6 bg-white text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-sm text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="encarta-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header with Profile Summary */}
      <div className="encarta-window mb-8">
        <div className="encarta-window-titlebar">
          <span className="encarta-window-title">✨ Your Personalized Financial Path</span>
        </div>
        <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {profile && (
                <>
                  <h2 className="text-lg font-bold mb-2">
                    Custom Plan for {profile.age}-year-old focused on{" "}
                    <span className="text-purple-600">
                      {profile.primary_goal?.replace(/_/g, ' ')}
                    </span>
                  </h2>
                  <p className="text-xs text-gray-600 mb-2">
                    This roadmap was AI-generated based on your income, goals, and current financial situation.
                  </p>
                  <div className="flex gap-2 text-xs text-gray-600">
                    <span>💰 {profile.income_range?.replace(/_/g, ' ')}</span>
                    <span>•</span>
                    <span>📊 {profile.risk_tolerance} risk</span>
                    <span>•</span>
                    <span>📚 {profile.difficulty_level} level</span>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={generateRoadmap}
              className="encarta-button flex items-center gap-2 text-xs flex-shrink-0"
              disabled={generating}
              title="Regenerate your roadmap with updated AI analysis"
            >
              <RefreshCw className={`w-3 h-3 ${generating ? 'animate-spin' : ''}`} /> 
              {generating ? 'Generating...' : 'Regenerate'}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-6 border-2 border-gray-800 bg-white relative">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-800">
              {completedSteps}/{steps.length} STEPS COMPLETE ({Math.round(progressPercentage)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Personalized Steps */}
      <div className="space-y-6">
        {steps.map((step, index) => {
          const isLocked = index > 0 && steps[index - 1].status !== 'completed';
          const isCompleted = step.status === 'completed';

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div
                className={`encarta-window transition-all ${
                  isLocked ? 'opacity-60' : 'hover:shadow-lg'
                }`}
              >
                <div className="encarta-window-titlebar">
                  <div className="flex items-center justify-between flex-1">
                    <span className="encarta-window-title">
                      STEP {step.step_order + 1}: {step.title}
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Priority Badge */}
                      <div className={`
                        text-[10px] px-2 py-0.5 font-bold
                        ${step.priority === 'critical' ? 'bg-red-600 text-white' :
                          step.priority === 'high' ? 'bg-orange-500 text-white' :
                          step.priority === 'medium' ? 'bg-yellow-500 text-black' :
                          'bg-gray-400 text-white'}
                      `}>
                        {step.priority.toUpperCase()}
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1 text-yellow-300">
                        {[...Array(3)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3"
                            fill={i < step.stars ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white">
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div
                      className={`w-12 h-12 flex-shrink-0 flex items-center justify-center border-2 ${
                        isCompleted
                          ? "bg-green-500 border-green-700"
                          : isLocked
                          ? "bg-gray-300 border-gray-500"
                          : "bg-purple-500 border-purple-700"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : isLocked ? (
                        <Lock className="w-6 h-6 text-gray-600" />
                      ) : (
                        <BookOpen className="w-6 h-6 text-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 mb-2">{step.description}</p>

                      {/* Duration */}
                      {step.estimated_duration && (
                        <div className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                          ⏱️ Estimated time: <span className="font-semibold">{step.estimated_duration}</span>
                        </div>
                      )}

                      {/* Why This Matters (Personalized) */}
                      {step.why_this_matters && (
                        <div className="mb-3 p-3 bg-purple-50 border-l-4 border-purple-600">
                          <p className="text-xs font-medium text-purple-900 mb-1">
                            💡 Why this is prioritized for you:
                          </p>
                          <p className="text-xs text-purple-800">{step.why_this_matters}</p>
                        </div>
                      )}

                      {/* Custom Advice */}
                      {step.custom_advice && (
                        <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-600">
                          <p className="text-xs font-medium text-blue-900 mb-1">🎯 Personalized Advice:</p>
                          <p className="text-xs text-blue-800">{step.custom_advice}</p>
                        </div>
                      )}

                      {/* Topics */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {step.topics.map((topic) => (
                          <button
                            key={topic}
                            className="encarta-button text-xs"
                            onClick={() => handleStepClick(step, topic)}
                            disabled={isLocked}
                          >
                            {topic}
                          </button>
                        ))}
                      </div>

                      {/* Quiz Button */}
                      {step.has_quiz && (
                        <button
                          className="encarta-button text-xs"
                          disabled={isLocked}
                          onClick={() => handleQuizClick(step)}
                        >
                          🎯 Take Personalized Quiz
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Completion */}
      {completedSteps === steps.length && steps.length > 0 && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="encarta-window mt-8"
        >
          <div className="encarta-window-titlebar">
            <span className="encarta-window-title">🏆 Congratulations!</span>
          </div>
          <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 text-center">
            <Trophy className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">You've Completed Your Personalized Path!</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your financial journey is unique, and you've taken amazing steps forward. Ready for the next level?
            </p>
            <button
              onClick={generateRoadmap}
              className="encarta-button bg-purple-600 text-white hover:bg-purple-700"
            >
              🔄 Generate Advanced Roadmap
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

