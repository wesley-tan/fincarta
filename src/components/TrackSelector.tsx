"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, TrendingUp, Bitcoin, Sparkles, Lock } from "lucide-react";

interface Track {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  badge?: string;
  badgeColor?: string;
  requiresAuth?: boolean;
}

interface TrackSelectorProps {
  activeTrack: string;
  onTrackChange: (trackId: string) => void;
  user: any;
}

export default function TrackSelector({ 
  activeTrack, 
  onTrackChange,
  user 
}: TrackSelectorProps) {
  const tracks: Track[] = [
    {
      id: "personal_finance",
      name: "Personal Finance",
      icon: <BookOpen className="w-5 h-5" />,
      description: "Master budgeting, savings & debt management",
      badge: "BEGINNER FRIENDLY",
      badgeColor: "bg-green-600"
    },
    {
      id: "investment",
      name: "Investment",
      icon: <TrendingUp className="w-5 h-5" />,
      description: "Learn stocks, bonds, ETFs & portfolio building",
      badge: "INTERMEDIATE",
      badgeColor: "bg-blue-600"
    },
    {
      id: "crypto",
      name: "Crypto",
      icon: <Bitcoin className="w-5 h-5" />,
      description: "Understand blockchain, DeFi & digital assets",
      badge: "ADVANCED",
      badgeColor: "bg-orange-600"
    },
    {
      id: "personalized",
      name: "My Personalized Path",
      icon: <Sparkles className="w-5 h-5" />,
      description: "AI-generated roadmap tailored to YOUR goals",
      badge: "✨ AI-POWERED",
      badgeColor: "bg-gradient-to-r from-purple-600 to-blue-600",
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
                    relative p-4 text-left border-2 transition-all min-h-[140px]
                    ${isActive 
                      ? 'border-blue-600 bg-blue-50 shadow-md' 
                      : 'border-gray-800 bg-white hover:bg-gray-50'
                    }
                    ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {/* Badge */}
                  {track.badge && (
                    <div className={`
                      absolute -top-2 -right-2 text-[10px] px-2 py-0.5 font-bold text-white
                      ${track.badgeColor || 'bg-gray-800'}
                    `}>
                      {track.badge}
                    </div>
                  )}

                  {/* Lock overlay for personalized track */}
                  {isLocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10">
                      <Lock className="w-8 h-8 text-gray-600 mb-2" />
                      <p className="text-xs font-bold text-gray-800">Sign in to unlock</p>
                    </div>
                  )}

                  {/* Icon and Title */}
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
                      className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Personalized Track CTA */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-sm mb-1">Get Your Personalized Financial Roadmap</p>
                  <p className="text-xs text-gray-700 mb-3">
                    Our AI analyzes your age, income, goals, and current situation to create a custom step-by-step plan just for you. Takes less than 2 minutes to set up!
                  </p>
                  <button 
                    onClick={() => window.location.href = '/login'}
                    className="encarta-button text-xs bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Sign In to Get Started →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Track Info */}
          <div className="mt-4 pt-4 border-t-2 border-gray-300">
            <p className="text-xs text-gray-600">
              {activeTrack === 'personalized' && user
                ? '🎯 You\'re on your personalized path - steps are tailored to your financial goals'
                : '💡 Tip: Complete steps in order to unlock new content and earn stars'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

