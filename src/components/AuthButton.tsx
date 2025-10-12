"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signInWithGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in:", error);
      alert("Failed to sign in. Please try again.");
    }
  }

  async function signInWithEmail() {
    const email = prompt("Enter your email:");
    if (!email) return;

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      alert("Check your email for the login link!");
    } catch (error) {
      console.error("Error signing in:", error);
      alert("Failed to send magic link. Please try again.");
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setShowMenu(false);
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to sign out. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className="encarta-button px-4 py-2 opacity-50 cursor-not-allowed">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="encarta-button px-4 py-2 flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In</span>
        </button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-0 mt-2 w-64 encarta-window z-50"
            >
              <div className="encarta-window-titlebar">
                <span className="encarta-window-title">🔐 Sign In</span>
                <button
                  onClick={() => setShowMenu(false)}
                  className="text-white hover:text-yellow-300"
                >
                  ×
                </button>
              </div>
              <div className="p-4 bg-white space-y-3">
                <button
                  onClick={signInWithGoogle}
                  className="encarta-button w-full flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </button>

                <button
                  onClick={signInWithEmail}
                  className="encarta-button w-full flex items-center justify-center gap-2"
                >
                  <span>📧</span>
                  Sign in with Email
                </button>

                <p className="text-xs text-gray-600 text-center">
                  Sign in to save your progress and access your data across devices
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="encarta-button px-4 py-2 flex items-center gap-2"
      >
        <UserIcon className="w-4 h-4" />
        <span className="hidden sm:inline">
          {user.email?.split("@")[0] || "Account"}
        </span>
      </button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 w-64 encarta-window z-50"
          >
            <div className="encarta-window-titlebar">
              <span className="encarta-window-title">👤 Account</span>
              <button
                onClick={() => setShowMenu(false)}
                className="text-white hover:text-yellow-300"
              >
                ×
              </button>
            </div>
            <div className="p-4 bg-white space-y-3">
              <div className="text-sm">
                <p className="font-bold text-gray-800">Signed in as:</p>
                <p className="text-gray-600 truncate">{user.email}</p>
              </div>

              <hr className="border-gray-300" />

              <button
                onClick={signOut}
                className="encarta-button w-full flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

