"use client";

import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface SummaryPanelProps {
  text: string;
  title: string;
}

export default function SummaryPanel({ text, title }: SummaryPanelProps) {
  const [ageLevel, setAgeLevel] = useState<number>(20);
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const ageLevels = {
    12: { label: "Explain Like I'm 12", emoji: "👶", description: "Simple & Fun" },
    20: { label: "College Level", emoji: "🎓", description: "Balanced & Clear" },
    40: { label: "Professional", emoji: "👔", description: "Detailed & Nuanced" },
  };

  // Map any slider value to nearest valid age level
  const getNearestAgeLevel = (value: number): 12 | 20 | 40 => {
    if (value < 16) return 12;
    if (value < 30) return 20;
    return 40;
  };

  const fetchSummary = async (level: number) => {
    setLoading(true);
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 3000), ageLevel: level }),
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
      }
    } catch (error) {
      console.error("Failed to fetch summary:", error);
      setSummary("Failed to generate summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(ageLevel);
  }, []);

  const handleAgeLevelChange = (values: number[]) => {
    const newLevel = getNearestAgeLevel(values[0]);
    if (newLevel !== ageLevel) {
      setAgeLevel(newLevel);
      fetchSummary(newLevel);
    }
  };

  const currentLevel = ageLevels[ageLevel as keyof typeof ageLevels];

  return (
    <div className="space-y-6">
      {/* Age Level Slider */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Understanding Level
            </h3>
            <span className="text-2xl">{currentLevel.emoji}</span>
          </div>

          <div className="space-y-2">
            <Slider
              value={[ageLevel]}
              onValueChange={handleAgeLevelChange}
              min={12}
              max={40}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>12 years</span>
              <span>20 years</span>
              <span>40 years</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg font-medium">{currentLevel.label}</p>
            <p className="text-sm text-muted-foreground">{currentLevel.description}</p>
          </div>
        </div>
      </Card>

      {/* Summary Display */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">AI-Generated Summary</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-3 text-muted-foreground">Generating summary...</span>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose dark:prose-invert max-w-none"
          >
            <p className="text-base leading-relaxed">{summary}</p>
          </motion.div>
        )}

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>TL;DR:</strong> This is a {ageLevel}-year-old level explanation of <strong>{title}</strong>.
            Adjust the slider above to see it explained differently!
          </p>
        </div>
      </Card>

      {/* Original Text Preview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Original Wikipedia Text (Preview)</h3>
        <div className="text-sm text-muted-foreground leading-relaxed max-h-48 overflow-y-auto">
          {text.slice(0, 800)}...
        </div>
      </Card>
    </div>
  );
}
