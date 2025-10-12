"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

interface SimpleOnboardingProps {
  userId: string;
  onComplete: () => void;
}

export default function SimpleOnboarding({ userId, onComplete }: SimpleOnboardingProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    primary_goal: "",
  });

  const supabase = createClient();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Save minimal profile - just the goal
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          primary_goal: formData.primary_goal,
          difficulty_level: 'beginner', // default
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // Set track preference to personalized
      await supabase
        .from('user_track_preference')
        .upsert({
          user_id: userId,
          active_track: 'personalized',
          last_switched: new Date().toISOString(),
        });

      onComplete();
    } catch (error: any) {
      console.error('Onboarding error:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = formData.primary_goal;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="encarta-window max-w-lg w-full"
      >
        <div className="encarta-window-titlebar">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="encarta-window-title">One Quick Question!</span>
          </div>
        </div>

        <div className="p-6 bg-white">
          <p className="text-sm text-gray-600 mb-6">
            What financial topic interests you most right now?
          </p>

          <div className="space-y-3">
            {[
              { value: 'debt_payoff', label: '💳 Pay Off Debt', desc: 'Get debt-free faster' },
              { value: 'retirement', label: '🏖️ Plan for Retirement', desc: 'Build long-term wealth' },
              { value: 'home_purchase', label: '🏠 Buy a Home', desc: 'Save for down payment' },
              { value: 'wealth_building', label: '📈 Build Wealth', desc: 'Grow investments' },
              { value: 'financial_security', label: '🛡️ Financial Security', desc: 'Emergency fund & insurance' },
              { value: 'just_learning', label: '📚 Just Learning', desc: 'Understand the basics' },
            ].map((goal) => (
              <button
                key={goal.value}
                onClick={() => setFormData({ primary_goal: goal.value })}
                className={`w-full p-4 border-2 text-left transition-all ${
                  formData.primary_goal === goal.value
                    ? 'border-purple-600 bg-purple-50 shadow-md'
                    : 'border-gray-800 hover:bg-gray-50 hover:border-purple-400'
                }`}
              >
                <div className="font-bold text-sm mb-1">{goal.label}</div>
                <div className="text-xs text-gray-600">{goal.desc}</div>
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-6 pt-6 border-t-2 border-gray-300">
            <button
              onClick={handleSubmit}
              disabled={!canProceed || loading}
              className="w-full encarta-button bg-purple-600 text-white flex items-center justify-center gap-2 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 text-sm"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  Finding Articles...
                </>
              ) : (
                <>
                  Get My Recommendations <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            {!canProceed && (
              <p className="text-xs text-gray-500 text-center mt-2">
                👆 Pick a goal to continue
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
