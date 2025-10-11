"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, ShieldCheck, AlertTriangle, XCircle, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TrustAnalysis {
  url: string;
  score: number;
  reliability: "high" | "medium" | "low";
  factors: string[];
  color: string;
}

interface TrustMeterProps {
  links: string[];
}

export default function TrustMeter({ links }: TrustMeterProps) {
  const [analysis, setAnalysis] = useState<TrustAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrustScores();
  }, [links]);

  const fetchTrustScores = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/trust-meter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error("Failed to fetch trust scores:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-muted-foreground">Analyzing source trustworthiness...</span>
      </div>
    );
  }

  if (analysis.length === 0) {
    return (
      <Card className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
        <h3 className="text-lg font-semibold mb-2">No External Sources Found</h3>
        <p className="text-sm text-muted-foreground">
          This article doesn't have external citations available for analysis.
        </p>
      </Card>
    );
  }

  const averageScore = Math.round(
    analysis.reduce((sum, a) => sum + a.score, 0) / analysis.length
  );

  const getReliabilityIcon = (reliability: string) => {
    switch (reliability) {
      case "high":
        return <ShieldCheck className="w-5 h-5 text-green-600" />;
      case "medium":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "low":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getReliabilityColor = (reliability: string) => {
    switch (reliability) {
      case "high":
        return "border-green-500 bg-green-50 dark:bg-green-950";
      case "medium":
        return "border-yellow-500 bg-yellow-50 dark:bg-yellow-950";
      case "low":
        return "border-red-500 bg-red-50 dark:bg-red-950";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Overall Trust Score</h3>
            <p className="text-sm text-muted-foreground">
              Based on {analysis.length} external source{analysis.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-5xl font-bold text-blue-600"
            >
              {averageScore}
            </motion.div>
            <p className="text-sm text-muted-foreground">out of 100</p>
          </div>
        </div>
      </Card>

      {/* Individual Sources */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Source Analysis</h3>
        
        {analysis.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={cn("p-4 border-l-4", getReliabilityColor(item.reliability))}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {getReliabilityIcon(item.reliability)}
                    <span className="font-semibold capitalize">{item.reliability} Reliability</span>
                    <span className="text-sm text-muted-foreground">({item.score}/100)</span>
                  </div>
                  
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-3 break-all"
                  >
                    {item.url}
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>

                  <div className="space-y-1">
                    {item.factors.map((factor, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span className="text-muted-foreground">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <div
                    className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg",
                      item.reliability === "high" && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
                      item.reliability === "medium" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
                      item.reliability === "low" && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                    )}
                  >
                    {item.score}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <Card className="p-4 bg-muted/50">
        <h4 className="font-semibold mb-3 text-sm">How We Calculate Trust Scores:</h4>
        <div className="grid gap-2 text-sm">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-green-600 mt-0.5" />
            <span><strong>High (70-100):</strong> Educational, government, or established sources</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <span><strong>Medium (50-69):</strong> General websites with HTTPS and standard verification</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
            <span><strong>Low (&lt;50):</strong> Unverified or questionable sources</span>
          </div>
        </div>
      </Card>
    </div>
  );
}