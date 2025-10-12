"use client";

import AuthWidget from "@/components/AuthWidget";
import BubbleBackground from "@/components/BubbleBackground";
import EncartaLogo from "@/components/EncartaLogo";

export default function LoginPage() {
  return (
    <div className="min-h-screen encarta-bg relative overflow-hidden">
      <BubbleBackground />
      <div className="absolute inset-0 bg-black/40 z-0" />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo and tagline */}
        <div className="text-center mb-8">
          <EncartaLogo />
          <h1 className="text-xl font-bold mt-2 text-white retro-shadow">
            Your AI Financial Education Encyclopedia
          </h1>
        </div>

        {/* Login window */}
        <div className="encarta-window w-full max-w-md">
          <div className="encarta-window-titlebar">
            <span className="encarta-window-title">🔐 FINCARTA LOGIN</span>
            <div className="encarta-window-controls">
              <div className="encarta-window-btn">_</div>
              <div className="encarta-window-btn">□</div>
              <div className="encarta-window-btn">×</div>
            </div>
          </div>

          <div className="p-6 bg-white text-center">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              Sign in to continue
            </h2>
            <AuthWidget />
            <p className="text-xs text-gray-500 mt-4">
              We use Google to securely authenticate your account.
            </p>
          </div>

          <div className="encarta-status-bar">
            <div className="encarta-status-panel">💡 Tip: Your data stays private</div>
            <div className="encarta-status-panel">🔒 Secure login powered by Supabase</div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-xs text-white opacity-80">
          Built with 💙 at BostonHacks
        </div>
      </div>
    </div>
  );
}