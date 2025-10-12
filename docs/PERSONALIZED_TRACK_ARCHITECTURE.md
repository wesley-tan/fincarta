# Personalized Track Architecture (Alternative Approach)

## 🎯 Goal
Create a **new "Personalized" track** that sits alongside existing static tracks (Personal Finance, Investment, etc.), offering AI-generated content tailored to each user's situation.

---

## 🏗️ Architecture Overview

### **Multi-Track System**

```
┌────────────────────────────────────────────────────────────┐
│                   FINANCIAL ROADMAP                        │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ 📚 Personal  │  │ 📈 Investment│  │ 🎯 MY PATH   │   │
│  │   Finance    │  │    Track     │  │ (NEW!)       │   │
│  │   (Static)   │  │   (Static)   │  │ (AI-Generated│   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                            ↑              │
│                                            │              │
│                                  ┌─────────────────┐     │
│                                  │  User Profile   │     │
│                                  │  + AI Engine    │     │
│                                  └─────────────────┘     │
└────────────────────────────────────────────────────────────┘
```

### **Key Differences from Previous Approach**

| Aspect | Previous (Modify Existing) | New (Separate Track) |
|--------|---------------------------|----------------------|
| **Static Tracks** | Modified with personalized overlays | Remain completely unchanged |
| **Personalized Content** | Blended into existing roadmap | Entirely separate track |
| **User Choice** | Toggle between views on same track | Switch between different tracks |
| **Implementation** | Requires modifying FinancialRoadmap.tsx | Add new track option |
| **Risk** | Could break existing features | Zero risk to existing tracks |
| **Flexibility** | Less flexible | Users can compare tracks side-by-side |

---

## 📊 Database Schema (Simplified)

### **1. User Profiles** (Same as before)
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Demographics
  age INTEGER,
  income_range TEXT,
  employment_status TEXT,
  
  -- Financial Situation
  current_savings DECIMAL DEFAULT 0,
  current_debt DECIMAL DEFAULT 0,
  monthly_expenses DECIMAL DEFAULT 0,
  has_emergency_fund BOOLEAN DEFAULT FALSE,
  has_401k BOOLEAN DEFAULT FALSE,
  has_ira BOOLEAN DEFAULT FALSE,
  
  -- Goals
  primary_goal TEXT,
  risk_tolerance TEXT DEFAULT 'moderate',
  difficulty_level TEXT DEFAULT 'beginner',
  
  -- Engagement
  last_login TIMESTAMP DEFAULT NOW(),
  streak_days INTEGER DEFAULT 0,
  
  CONSTRAINT valid_income_range CHECK (income_range IN ('under_30k', '30k_50k', '50k_75k', '75k_100k', '100k_150k', '150k_plus'))
);
```

### **2. Personalized Track Steps**
```sql
CREATE TABLE personalized_track_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Step Details
  step_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL, -- 'critical', 'high', 'medium', 'low'
  estimated_duration TEXT,
  
  -- Content
  topics TEXT[] NOT NULL,
  custom_advice TEXT,
  why_this_matters TEXT, -- NEW: Explain why this step is personalized for them
  
  -- Progress
  status TEXT DEFAULT 'pending',
  completed_at TIMESTAMP,
  stars INTEGER DEFAULT 0,
  
  -- Quiz
  has_quiz BOOLEAN DEFAULT TRUE,
  quiz_questions JSONB,
  
  CONSTRAINT valid_priority CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped'))
);

CREATE INDEX idx_personalized_track_user ON personalized_track_steps(user_id, step_order);
```

### **3. Track Selection Preference**
```sql
CREATE TABLE user_track_preference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  active_track TEXT DEFAULT 'personal_finance', -- 'personal_finance', 'investment', 'personalized'
  last_switched TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_track CHECK (active_track IN ('personal_finance', 'investment', 'crypto', 'personalized'))
);
```

---

## 🎨 UI Design

### **Track Selector Component**

```typescript
// src/components/TrackSelector.tsx

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { BookOpen, TrendingUp, Bitcoin, Sparkles } from "lucide-react";

interface Track {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  badge?: string;
  requiresAuth?: boolean;
}

export default function TrackSelector({ 
  activeTrack, 
  onTrackChange,
  user 
}: { 
  activeTrack: string; 
  onTrackChange: (track: string) => void;
  user: any;
}) {
  const tracks: Track[] = [
    {
      id: "personal_finance",
      name: "Personal Finance",
      icon: <BookOpen className="w-5 h-5" />,
      description: "Master budgeting, savings & debt management",
      badge: "BEGINNER FRIENDLY"
    },
    {
      id: "investment",
      name: "Investment",
      icon: <TrendingUp className="w-5 h-5" />,
      description: "Learn stocks, bonds, ETFs & portfolio building",
      badge: "INTERMEDIATE"
    },
    {
      id: "crypto",
      name: "Crypto",
      icon: <Bitcoin className="w-5 h-5" />,
      description: "Understand blockchain, DeFi & digital assets",
      badge: "ADVANCED"
    },
    {
      id: "personalized",
      name: "My Personalized Path",
      icon: <Sparkles className="w-5 h-5" />,
      description: "AI-generated roadmap tailored to YOUR goals",
      badge: "✨ AI-POWERED",
      requiresAuth: true
    }
  ];

  return (
    <div className="w-full mb-8">
      <div className="encarta-window">
        <div className="encarta-window-titlebar">
          <span className="encarta-window-title">🗺️ Choose Your Learning Path</span>
        </div>
        
        <div className="p-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tracks.map((track) => {
              const isLocked = track.requiresAuth && !user;
              const isActive = activeTrack === track.id;
              
              return (
                <motion.button
                  key={track.id}
                  onClick={() => !isLocked && onTrackChange(track.id)}
                  disabled={isLocked}
                  whileHover={!isLocked ? { scale: 1.02 } : {}}
                  whileTap={!isLocked ? { scale: 0.98 } : {}}
                  className={`
                    relative p-4 text-left border-2 transition-all
                    ${isActive 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-800 bg-white hover:bg-gray-50'
                    }
                    ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {/* Badge */}
                  <div className={`
                    absolute -top-2 -right-2 text-[10px] px-2 py-0.5 font-bold
                    ${track.id === 'personalized' 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                      : 'bg-gray-800 text-white'
                    }
                  `}>
                    {track.badge}
                  </div>

                  {/* Lock icon for personalized track */}
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                      <div className="text-center">
                        <div className="text-3xl mb-1">🔒</div>
                        <p className="text-xs font-bold">Sign in to unlock</p>
                      </div>
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`
                    mb-3 flex items-center gap-2
                    ${isActive ? 'text-blue-600' : 'text-gray-700'}
                  `}>
                    {track.icon}
                    <span className="font-bold text-sm">{track.name}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {track.description}
                  </p>

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-2 left-2 right-2 h-1 bg-blue-600"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Personalized Track CTA */}
          {activeTrack === "personalized" && !user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-sm mb-1">Get Your Personalized Financial Roadmap</p>
                  <p className="text-xs text-gray-700 mb-3">
                    Our AI analyzes your age, income, goals, and current situation to create a custom step-by-step plan just for you.
                  </p>
                  <button className="encarta-button text-xs bg-purple-600 text-white">
                    Sign In to Get Started →
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 🔄 Implementation Steps

### **Step 1: Update Roadmap Page Structure**

Update: `src/app/roadmap/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import TrackSelector from "@/components/TrackSelector";
import FinancialRoadmap from "@/components/FinancialRoadmap";
import PersonalizedTrack from "@/components/PersonalizedTrack"; // NEW
import OnboardingModal from "@/components/OnboardingModal";

export default function RoadmapPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTrack, setActiveTrack] = useState("personal_finance");
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Load user's track preference
        const { data: pref } = await supabase
          .from('user_track_preference')
          .select('active_track')
          .eq('user_id', user.id)
          .single();

        if (pref) {
          setActiveTrack(pref.active_track);
        }

        // Check if needs onboarding
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!profile || !profile.primary_goal) {
          setNeedsOnboarding(true);
        }
      }

      setLoading(false);
    }

    init();
  }, []);

  const handleTrackChange = async (trackId: string) => {
    // If switching to personalized track and needs onboarding
    if (trackId === "personalized" && !user) {
      // Redirect to sign in
      window.location.href = "/login";
      return;
    }

    if (trackId === "personalized" && needsOnboarding) {
      setNeedsOnboarding(true);
      return;
    }

    setActiveTrack(trackId);

    // Save preference
    if (user) {
      await supabase
        .from('user_track_preference')
        .upsert({
          user_id: user.id,
          active_track: trackId,
          last_switched: new Date().toISOString()
        });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">💾</div>
          <p className="text-sm">Loading your roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Track Selector */}
      <TrackSelector
        activeTrack={activeTrack}
        onTrackChange={handleTrackChange}
        user={user}
      />

      {/* Render appropriate track */}
      {activeTrack === "personalized" && user ? (
        <PersonalizedTrack userId={user.id} />
      ) : (
        <FinancialRoadmap trackId={activeTrack} />
      )}

      {/* Onboarding Modal */}
      {needsOnboarding && user && (
        <OnboardingModal
          userId={user.id}
          onComplete={() => {
            setNeedsOnboarding(false);
            setActiveTrack("personalized");
          }}
        />
      )}
    </div>
  );
}
```

---

## 🎯 Personalized Track Component

Create: `src/components/PersonalizedTrack.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { Check, Lock, Star, BookOpen, RefreshCw, Zap, AlertCircle } from "lucide-react";

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
}

export default function PersonalizedTrack({ userId }: { userId: string }) {
  const router = useRouter();
  const [steps, setSteps] = useState<PersonalizedStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadPersonalizedSteps();
    loadProfile();
  }, [userId]);

  async function loadProfile() {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
  }

  async function loadPersonalizedSteps() {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('personalized_track_steps')
      .select('*')
      .eq('user_id', userId)
      .order('step_order', { ascending: true });

    if (data && data.length > 0) {
      setSteps(data);
    } else {
      // No steps yet, generate them
      await generateRoadmap();
    }

    setLoading(false);
  }

  async function generateRoadmap() {
    setGenerating(true);
    
    try {
      const response = await fetch('/api/personalized-roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        await loadPersonalizedSteps();
      }
    } catch (error) {
      console.error('Failed to generate roadmap:', error);
    }

    setGenerating(false);
  }

  const handleStepClick = (step: PersonalizedStep, topic: string) => {
    if (step.status === 'completed') return;
    router.push(`/?search=${encodeURIComponent(topic)}`);
  };

  const handleQuizClick = (step: PersonalizedStep) => {
    router.push(`/roadmap/personalized/quiz/${step.id}`);
  };

  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const progressPercentage = (completedSteps / steps.length) * 100 || 0;

  if (loading || generating) {
    return (
      <div className="encarta-window">
        <div className="encarta-window-titlebar">
          <span className="encarta-window-title">✨ Generating Your Personalized Path...</span>
        </div>
        <div className="p-8 bg-white text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-4"
          >
            <Zap className="w-12 h-12 text-purple-600" />
          </motion.div>
          <p className="text-sm text-gray-700">
            Our AI is analyzing your profile and creating a custom roadmap just for you...
          </p>
          <p className="text-xs text-gray-500 mt-2">This takes about 5-10 seconds</p>
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
            <div>
              <h2 className="text-lg font-bold mb-2">
                Custom Plan for {profile?.age}-year-old focused on{" "}
                <span className="text-purple-600">
                  {profile?.primary_goal?.replace('_', ' ')}
                </span>
              </h2>
              <p className="text-xs text-gray-600">
                This roadmap was AI-generated based on your income, goals, and current financial situation.
              </p>
            </div>
            <button
              onClick={generateRoadmap}
              className="encarta-button flex items-center gap-2 text-xs"
              disabled={generating}
            >
              <RefreshCw className="w-3 h-3" /> Regenerate
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
              {completedSteps}/{steps.length} STEPS COMPLETE
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
              transition={{ delay: index * 0.1 }}
            >
              <div
                className={`encarta-window ${
                  isLocked ? 'opacity-50' : 'hover:shadow-lg'
                } transition-all`}
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
                      <div className="text-xs text-gray-500 mb-3">
                        ⏱️ Estimated time: {step.estimated_duration}
                      </div>

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
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold mb-2">You've Completed Your Personalized Path!</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your financial journey is unique, and you've taken amazing steps forward.
            </p>
            <button
              onClick={generateRoadmap}
              className="encarta-button bg-purple-600 text-white"
            >
              🔄 Generate Next Level Roadmap
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
```

---

## 🚀 Implementation Benefits

### **Advantages of This Approach**

1. **Zero Risk to Existing Features**
   - Static tracks (Personal Finance, Investment) remain 100% unchanged
   - No breaking changes to existing UI/UX

2. **User Choice & Flexibility**
   - Users can easily switch between tracks
   - Can compare personalized vs. standard paths
   - No forced personalization

3. **Easier Testing & Iteration**
   - A/B test personalized track vs. static
   - Measure engagement separately
   - Roll back if needed without affecting core features

4. **Scalability**
   - Can add more static tracks later (Crypto, Real Estate, etc.)
   - Each track can have its own characteristics
   - Personalized track can evolve independently

5. **Marketing Opportunity**
   - "Unlock Your Personalized Path" is a great conversion hook
   - Premium feature behind authentication
   - Clear value proposition

---

## 📋 Implementation Checklist

### **Phase 1: Track Infrastructure (Week 1)**
- [ ] Create `TrackSelector` component
- [ ] Add `user_track_preference` table
- [ ] Update roadmap page to support multiple tracks
- [ ] Test track switching

### **Phase 2: Personalized Track (Week 2)**
- [ ] Create `PersonalizedTrack` component
- [ ] Build `/api/personalized-roadmap/generate` endpoint
- [ ] Implement AI roadmap generation with Gemini
- [ ] Add database tables for personalized steps

### **Phase 3: Onboarding (Week 2-3)**
- [ ] Create `OnboardingModal` component
- [ ] Collect user profile data
- [ ] Generate initial personalized roadmap
- [ ] Handle edge cases (incomplete profiles, etc.)

### **Phase 4: Polish (Week 3-4)**
- [ ] Add regenerate roadmap feature
- [ ] Implement progress tracking
- [ ] Add personalized quizzes
- [ ] Create insights dashboard

---

## 🎯 Next Steps

1. **Does this approach align better with your vision?**
2. **Should we implement this instead of the previous approach?**
3. **Ready to start with Phase 1?**

This is cleaner, safer, and more user-friendly! 🚀

