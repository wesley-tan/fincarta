"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import EncartaLogo from "@/components/EncartaLogo";
import BubbleBackground from "@/components/BubbleBackground";
import FinancialRoadmap from "@/components/FinancialRoadmap";
import PersonalizedTrack from "@/components/PersonalizedTrack";
import SimpleOnboarding from "@/components/SimpleOnboarding";
import UserProfile from "@/components/UserProfile";
import { motion } from "framer-motion";
import { BookOpen, TrendingUp, Bitcoin, Sparkles, Lock } from "lucide-react";

export default function RoadmapPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeTrack, setActiveTrack] = useState("personal_finance");
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      if (authLoading) return;

      try {
        if (user) {
          // Load user's track preference
          const { data: pref } = await supabase
            .from('user_track_preference')
            .select('active_track')
            .eq('user_id', user.id)
            .single();

          if (pref && pref.active_track) {
            setActiveTrack(pref.active_track);
          }

          // Check if needs onboarding
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!profile || !profile.primary_goal) {
            // Has account but no profile - show onboarding if trying to access personalized
            if (pref && pref.active_track === 'personalized') {
              setNeedsOnboarding(true);
            }
          }
        }
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [authLoading, user]);

  const handleTrackChange = async (trackId: string) => {
    // If switching to personalized track and not logged in
    if (trackId === "personalized" && !user) {
      router.push("/auth/signin");
      return;
    }

    // If switching to personalized track and needs onboarding
    if (trackId === "personalized" && user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile || !profile.primary_goal) {
        setNeedsOnboarding(true);
        setActiveTrack(trackId);
        return;
      }
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

  if (loading || authLoading) {
    return (
      <div className="min-h-screen encarta-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">💾</div>
          <p className="text-sm">Loading your roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen encarta-bg relative overflow-y-auto overflow-x-hidden">
      <BubbleBackground />
      
      <div className="relative z-10">
        {/* Header with Navigation */}
        <header className="pt-8 pb-6 px-4">
          <div className="container mx-auto">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1"></div>
              <div className="flex justify-center flex-1">
                <EncartaLogo handleSearch={(query) => router.push(`/?search=${query}`)} />
              </div>
              <div className="flex-1 flex justify-end">
                <UserProfile />
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => router.push("/")}
                className="encarta-tab"
                data-state="inactive"
              >
                🔍 Reference Mode
              </button>
              <button
                className="encarta-tab"
                data-state="active"
              >
                🎓 Learn Mode
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Learning Tracks */}
            <div className="w-full mb-8">
              <div className="encarta-window">
                <div className="encarta-window-titlebar">
                  <span className="encarta-window-title">🎓 LEARNING TRACKS</span>
                </div>
                
                <div className="p-6 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Personal Finance Track */}
                    <button
                      onClick={() => handleTrackChange('personal_finance')}
                      className={`relative p-4 text-left border-2 transition-all ${
                        activeTrack === 'personal_finance'
                          ? 'border-blue-600 bg-blue-50 shadow-md'
                          : 'border-gray-800 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-600 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-sm">Personal Finance</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed mb-3">
                        Master budgeting, debt, retirement, and wealth building
                      </p>
                      {activeTrack === 'personal_finance' && (
                        <div className="bg-blue-600 text-white text-xs px-2 py-1 inline-block font-bold">
                          ✓ ACTIVE TRACK
                        </div>
                      )}
                    </button>

                    {/* Investment Track */}
                    <button
                      onClick={() => handleTrackChange('investment')}
                      disabled
                      className="relative p-4 text-left border-2 border-gray-800 bg-white opacity-50 cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gray-400 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-sm text-gray-600">Investments</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed mb-3">
                        Stocks, bonds, ETFs, portfolios, and asset allocation
                      </p>
                      <div className="bg-yellow-500 text-black text-xs px-2 py-1 inline-block font-bold">
                        🔒 COMING SOON
                      </div>
                    </button>

                    {/* Crypto Track */}
                    <button
                      onClick={() => handleTrackChange('crypto')}
                      disabled
                      className="relative p-4 text-left border-2 border-gray-800 bg-white opacity-50 cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gray-400 flex items-center justify-center">
                          <Bitcoin className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-sm text-gray-600">Cryptocurrency</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed mb-3">
                        Bitcoin, blockchain, DeFi, and digital asset investing
                      </p>
                      <div className="bg-yellow-500 text-black text-xs px-2 py-1 inline-block font-bold">
                        🔒 COMING SOON
                      </div>
                    </button>

                    {/* Personalized Track */}
                    <button
                      onClick={() => handleTrackChange('personalized')}
                      className={`relative p-4 text-left border-2 transition-all ${
                        activeTrack === 'personalized'
                          ? 'border-purple-600 bg-purple-50 shadow-md'
                          : user
                          ? 'border-gray-800 bg-white hover:bg-gray-50'
                          : 'border-gray-800 bg-white opacity-50 cursor-not-allowed'
                      }`}
                      disabled={!user}
                    >
                      {!user && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10">
                          <Lock className="w-6 h-6 text-gray-600 mb-1" />
                          <p className="text-xs font-bold text-gray-800">Sign in to unlock</p>
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-sm">My Personalized Path</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed mb-3">
                        AI-generated roadmap tailored to YOUR goals
                      </p>
                      {activeTrack === 'personalized' && user && (
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-2 py-1 inline-block font-bold">
                          ✓ ACTIVE TRACK
                        </div>
                      )}
                      {activeTrack !== 'personalized' && user && (
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-2 py-1 inline-block font-bold">
                          ✨ AI-POWERED
                        </div>
                      )}
                    </button>
                  </div>

                  {!user && (
                    <div className="mt-4 p-3 bg-purple-50 border-2 border-purple-300 text-xs text-gray-700">
                      <Sparkles className="w-4 h-4 inline mr-2 text-purple-600" />
                      <strong>Get Your Personalized Financial Roadmap:</strong> Sign in to unlock AI-powered custom learning paths tailored to your age, income, and goals.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Render appropriate track */}
            {activeTrack === "personalized" && user ? (
              <PersonalizedTrack userId={user.id} />
            ) : (
              <FinancialRoadmap />
            )}
          </motion.div>
        </main>
      </div>

      {/* Simplified Onboarding Modal */}
      {needsOnboarding && user && (
        <SimpleOnboarding
          userId={user.id}
          onComplete={() => {
            setNeedsOnboarding(false);
            // Reload to show personalized track
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}