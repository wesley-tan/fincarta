"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EncartaLogo from "@/components/EncartaLogo";
import BubbleBackground from "@/components/BubbleBackground";
import FinancialRoadmap from "@/components/FinancialRoadmap";
import { motion } from "framer-motion";

export default function RoadmapPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen encarta-bg relative overflow-y-auto overflow-x-hidden">
      <BubbleBackground />
      
      <div className="relative z-10">
        {/* Header with Navigation */}
        <header className="pt-8 pb-6 px-4">
          <div className="container mx-auto">
            <div className="flex justify-center mb-6">
              <EncartaLogo />
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
            <FinancialRoadmap />
          </motion.div>
        </main>
      </div>
    </div>
  );
}