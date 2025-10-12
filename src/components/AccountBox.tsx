"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

export default function AccountBox() {
  const [user, setUser] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (!user) return null;

  return (
    <div
      className="fixed top-4 right-4 encarta-window w-48 z-50 cursor-pointer"
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="encarta-window-titlebar">
        <span className="encarta-window-title">👤 {user.user_metadata?.name || "User"}</span>
      </div>

      {expanded && (
        <div className="p-3 bg-white text-xs text-gray-600">
          <p className="mb-2 text-gray-500">{user.email}</p>
          <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      )}
    </div>
  );
}