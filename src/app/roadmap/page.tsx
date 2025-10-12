"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import EncartaLogo from "@/components/EncartaLogo";
import BubbleBackground from "@/components/BubbleBackground";
import FinancialRoadmap from "@/components/FinancialRoadmap";
import TrackSelector from "@/components/TrackSelector";
import PersonalizedTrack from "@/components/PersonalizedTrack";
import OnboardingModal from "@/components/OnboardingModal";
import { motion } from "framer-motion";

export default function RoadmapPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTrack, setActiveTrack] = useState("personal_finance");
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        // Check if Supabase is configured
        const isSupabaseConfigured = 
          process.env.NEXT_PUBLIC_SUPABASE_URL && 
          process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

        if (!isSupabaseConfigured) {
          // Supabase not configured, use static tracks only
          setLoading(false);
          return;
        }

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
  }, []);

  const handleTrackChange = async (trackId: string) => {
    // If switching to personalized track and not logged in
    if (trackId === "personalized" && !user) {
      // Redirect to sign in
      window.location.href = "/login";
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

      // Log track switch
      await supabase.from('user_activity_log').insert({
        user_id: user.id,
        activity_type: 'track_switched',
        metadata: { 
          from_track: activeTrack,
          to_track: trackId,
          timestamp: new Date().toISOString() 
        }
      });
    }
  };

  if (loading) {
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
            <div className="flex justify-center mb-6">
              <EncartaLogo handleSearch={(query) => router.push(`/?search=${query}`)} />
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
              <FinancialRoadmap />
            )}
          </motion.div>
        </main>
      </div>

      {/* Onboarding Modal */}
      {needsOnboarding && user && (
        <OnboardingModal
          userId={user.id}
          onComplete={() => {
            setNeedsOnboarding(false);
            // Reload to show personalized track
            window.location.reload();
          }}
          onSkip={() => {
            setNeedsOnboarding(false);
            setActiveTrack("personal_finance");
          }}
        />
      )}
    </div>
  );
}