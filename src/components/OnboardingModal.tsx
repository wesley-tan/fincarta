"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

interface OnboardingModalProps {
  userId: string;
  onComplete: () => void;
  onSkip?: () => void;
}

export default function OnboardingModal({ userId, onComplete, onSkip }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: "",
    income_range: "",
    employment_status: "employed",
    current_savings: "",
    current_debt: "",
    monthly_expenses: "",
    has_emergency_fund: false,
    has_401k: false,
    has_ira: false,
    primary_goal: "",
    risk_tolerance: "moderate",
    time_horizon: "medium",
    learning_style: "mixed",
    difficulty_level: "beginner",
  });

  const totalSteps = 5;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Save user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          ...formData,
          age: parseInt(formData.age) || null,
          current_savings: parseFloat(formData.current_savings) || 0,
          current_debt: parseFloat(formData.current_debt) || 0,
          monthly_expenses: parseFloat(formData.monthly_expenses) || 0,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // 2. Set track preference to personalized
      await supabase
        .from('user_track_preference')
        .upsert({
          user_id: userId,
          active_track: 'personalized',
          last_switched: new Date().toISOString(),
        });

      // 3. Log onboarding completion
      await supabase
        .from('user_activity_log')
        .insert({
          user_id: userId,
          activity_type: 'login',
          metadata: { onboarding_completed: true, timestamp: new Date().toISOString() }
        });

      // 4. Complete onboarding
      onComplete();
    } catch (error: any) {
      console.error('Onboarding error:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    if (step === 1) return formData.age && formData.income_range;
    if (step === 2) return formData.current_savings !== "" && formData.monthly_expenses !== "";
    if (step === 3) return formData.primary_goal;
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="encarta-window max-w-2xl w-full my-8"
      >
        <div className="encarta-window-titlebar">
          <div className="flex items-center justify-between flex-1">
            <span className="encarta-window-title flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Let's Personalize Your Financial Journey (Step {step}/{totalSteps})
            </span>
            {onSkip && (
              <button 
                onClick={onSkip}
                className="text-xs hover:underline mr-8"
                title="Skip onboarding (you can complete it later)"
              >
                Skip for now
              </button>
            )}
          </div>
        </div>

        <div className="p-6 bg-white max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex gap-2">
              {[...Array(totalSteps)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 ${
                    i + 1 <= step ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Demographics */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-xl font-bold mb-4">Tell us about yourself</h3>
                <p className="text-sm text-gray-600 mb-6">
                  This helps us create a roadmap tailored to your situation.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Age *</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full border-2 border-gray-800 p-2 text-sm"
                      placeholder="e.g., 28"
                      min="18"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Employment Status</label>
                    <select
                      value={formData.employment_status}
                      onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}
                      className="w-full border-2 border-gray-800 p-2 text-sm"
                    >
                      <option value="employed">Employed</option>
                      <option value="self_employed">Self-Employed</option>
                      <option value="student">Student</option>
                      <option value="retired">Retired</option>
                      <option value="unemployed">Between Jobs</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Annual Income Range *</label>
                    <select
                      value={formData.income_range}
                      onChange={(e) => setFormData({ ...formData, income_range: e.target.value })}
                      className="w-full border-2 border-gray-800 p-2 text-sm"
                    >
                      <option value="">Select your income range...</option>
                      <option value="under_30k">Under $30,000</option>
                      <option value="30k_50k">$30,000 - $50,000</option>
                      <option value="50k_75k">$50,000 - $75,000</option>
                      <option value="75k_100k">$75,000 - $100,000</option>
                      <option value="100k_150k">$100,000 - $150,000</option>
                      <option value="150k_plus">$150,000+</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Financial Situation */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-xl font-bold mb-4">Your current financial situation</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Don't worry if you don't know exact numbers - estimates are fine!
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Current Savings ($) *</label>
                    <input
                      type="number"
                      value={formData.current_savings}
                      onChange={(e) => setFormData({ ...formData, current_savings: e.target.value })}
                      className="w-full border-2 border-gray-800 p-2 text-sm"
                      placeholder="e.g., 5000"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Include checking, savings, and emergency funds</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Current Debt ($)</label>
                    <input
                      type="number"
                      value={formData.current_debt}
                      onChange={(e) => setFormData({ ...formData, current_debt: e.target.value })}
                      className="w-full border-2 border-gray-800 p-2 text-sm"
                      placeholder="e.g., 10000"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Credit cards, student loans, personal loans (excluding mortgage)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Monthly Expenses ($) *</label>
                    <input
                      type="number"
                      value={formData.monthly_expenses}
                      onChange={(e) => setFormData({ ...formData, monthly_expenses: e.target.value })}
                      className="w-full border-2 border-gray-800 p-2 text-sm"
                      placeholder="e.g., 2500"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Rent, food, bills, subscriptions, etc.</p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.has_emergency_fund}
                        onChange={(e) => setFormData({ ...formData, has_emergency_fund: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">I have an emergency fund (3-6 months expenses)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.has_401k}
                        onChange={(e) => setFormData({ ...formData, has_401k: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">I contribute to a 401(k) or employer retirement plan</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.has_ira}
                        onChange={(e) => setFormData({ ...formData, has_ira: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">I have an IRA (Roth or Traditional)</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Goals */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-xl font-bold mb-4">What's your main financial goal?</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Choose the one that matters most to you right now.
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'debt_payoff', label: '💳 Pay Off Debt', desc: 'Eliminate credit cards, loans' },
                    { value: 'retirement', label: '🏖️ Retirement', desc: 'Build long-term wealth' },
                    { value: 'home_purchase', label: '🏠 Buy a Home', desc: 'Save for down payment' },
                    { value: 'wealth_building', label: '📈 Build Wealth', desc: 'Grow investments' },
                    { value: 'financial_security', label: '🛡️ Financial Security', desc: 'Emergency fund, insurance' },
                    { value: 'education', label: '🎓 Education', desc: 'Save for school' },
                  ].map((goal) => (
                    <button
                      key={goal.value}
                      onClick={() => setFormData({ ...formData, primary_goal: goal.value })}
                      className={`p-4 border-2 text-left transition-all ${
                        formData.primary_goal === goal.value
                          ? 'border-purple-600 bg-purple-50 shadow-md'
                          : 'border-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-bold text-sm mb-1">{goal.label}</div>
                      <div className="text-xs text-gray-600">{goal.desc}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Investment Style */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-xl font-bold mb-4">Your investment style</h3>
                <p className="text-sm text-gray-600 mb-6">
                  This helps us recommend appropriate strategies for you.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Risk Tolerance</label>
                    <div className="space-y-2">
                      {[
                        { value: 'conservative', label: '🐢 Conservative', desc: 'Safety first, slow and steady growth' },
                        { value: 'moderate', label: '⚖️ Moderate', desc: 'Balanced approach, mix of safety and growth' },
                        { value: 'aggressive', label: '🚀 Aggressive', desc: 'Higher risk for potentially higher returns' },
                      ].map((risk) => (
                        <button
                          key={risk.value}
                          onClick={() => setFormData({ ...formData, risk_tolerance: risk.value })}
                          className={`w-full p-3 border-2 text-left transition-all ${
                            formData.risk_tolerance === risk.value
                              ? 'border-purple-600 bg-purple-50 shadow-md'
                              : 'border-gray-800 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-bold text-sm">{risk.label}</div>
                          <div className="text-xs text-gray-600">{risk.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Time Horizon</label>
                    <select
                      value={formData.time_horizon}
                      onChange={(e) => setFormData({ ...formData, time_horizon: e.target.value })}
                      className="w-full border-2 border-gray-800 p-2 text-sm"
                    >
                      <option value="short">Short-term (0-2 years)</option>
                      <option value="medium">Medium-term (3-7 years)</option>
                      <option value="long">Long-term (8+ years)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">When do you need to reach your goal?</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Learning Preferences */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-xl font-bold mb-4">How do you learn best?</h3>
                <p className="text-sm text-gray-600 mb-6">
                  We'll tailor the content to match your learning style.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Learning Style</label>
                    <select
                      value={formData.learning_style}
                      onChange={(e) => setFormData({ ...formData, learning_style: e.target.value })}
                      className="w-full border-2 border-gray-800 p-2 text-sm"
                    >
                      <option value="visual">📊 Visual (charts, diagrams, infographics)</option>
                      <option value="reading">📚 Reading (articles, guides, detailed explanations)</option>
                      <option value="interactive">🎮 Interactive (quizzes, calculators, hands-on)</option>
                      <option value="mixed">🎨 Mixed (all of the above)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Current Knowledge Level</label>
                    <select
                      value={formData.difficulty_level}
                      onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                      className="w-full border-2 border-gray-800 p-2 text-sm"
                    >
                      <option value="beginner">🌱 Beginner (New to personal finance)</option>
                      <option value="intermediate">📖 Intermediate (Know the basics)</option>
                      <option value="advanced">🎓 Advanced (Experienced with finance)</option>
                    </select>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 p-4 mt-6">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium mb-2">🎉 You're all set!</p>
                        <p className="text-xs text-gray-700">
                          We'll create a personalized financial roadmap based on your profile.
                          This will take about 5-10 seconds...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-6 pt-4 border-t-2 border-gray-300">
            <button 
              onClick={prevStep}
              disabled={step === 1}
              className={`encarta-button flex items-center gap-2 ${step === 1 ? 'invisible' : ''}`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {step < totalSteps ? (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className="encarta-button flex items-center gap-2 bg-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="encarta-button bg-purple-600 text-white flex items-center gap-2 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                    Creating...
                  </>
                ) : (
                  <>
                    Create My Roadmap <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

