"use client";

import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface SummaryPanelProps {
  text: string;
  title: string;
  pageId?: number;
}

export default function SummaryPanel({ text, title, pageId }: SummaryPanelProps) {
  const [ageLevel, setAgeLevel] = useState<number>(2);
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [summaries, setSummaries] = useState<{ [key: number]: string }>({1: '', 2: '', 3: ''});

  const ageLevels = {
    1: { label: "Beginner", emoji: "👶", description: "Simple & Fun" },
    2: { label: "Intermediate", emoji: "🎓", description: "Balanced & Clear" },
    3: { label: "Advanced", emoji: "👔", description: "Detailed & Nuanced" },
  };

  const fetchSummary = async (level: number) => {
    setLoading(true);
    if (summaries[level]) {
      setSummary(summaries[level]);
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 3000), ageLevel: level }),
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
        setSummaries(prev => ({...prev, [level]: data.summary}));
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
    const newLevel = values[0];
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
              min={1}
              max={3}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Beginner</span>
              <span>Intermediate</span>
              <span>Advanced</span>
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
            <div 
              className="text-base leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: summary
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/\n\n/g, '</p><p>')
                  .replace(/^(.*)$/, '<p>$1</p>')
              }}
            />
          </motion.div>
        )}

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>TL;DR:</strong> This is a {currentLevel.label} level explanation of <strong>{title}</strong>.
            Adjust the slider above to see it explained differently!
          </p>
        </div>
      </Card>

      {/* Original Text Preview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Original Wikipedia Text (Preview)</h3>
        <div className="text-sm text-muted-foreground leading-relaxed max-h-48 overflow-y-auto mb-4">
          {text.slice(0, 800)}...
        </div>
        
        {/* Wikipedia Citation Link */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <a
            href={`https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Read the full article on Wikipedia
          </a>
          <p className="text-xs text-muted-foreground mt-2">
            📚 Source: Wikipedia - "{title}" {pageId && `(Page ID: ${pageId})`}
          </p>
        </div>
      </Card>
    </div>
  );
}
