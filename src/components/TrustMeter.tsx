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
  const [displayCount, setDisplayCount] = useState(10); // Show 10 sources initially

  useEffect(() => {
    fetchTrustScores();
    setDisplayCount(10); // Reset display count when new links are fetched
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
      {/* Source Origin Explanation */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              📚 Source Analysis: Wikipedia External Links
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              We analyze <strong>all external URLs from the Wikipedia article</strong>, including citation references, 
              external resources, and related links. Wikipedia's editorial process requires that articles link to 
              verifiable and reliable sources. Our Trust Meter evaluates each link's credibility based on domain 
              authority, security, and publisher reputation.
            </p>
          </div>
        </div>
      </Card>

      {/* Overall Score */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Overall Trust Score</h3>
            <p className="text-sm text-muted-foreground">
              Based on {analysis.length} external link{analysis.length !== 1 ? "s" : ""} from Wikipedia article
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
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Source Analysis</h3>
          {analysis.length > 10 && (
            <p className="text-sm text-muted-foreground">
              Showing {Math.min(displayCount, analysis.length)} of {analysis.length} sources
            </p>
          )}
        </div>
        
        {analysis.slice(0, displayCount).map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(index * 0.05, 0.5) }} // Cap delay for better UX with many items
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

        {/* Show More Button */}
        {displayCount < analysis.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center pt-4"
          >
            <button
              onClick={() => setDisplayCount(prev => Math.min(prev + 10, analysis.length))}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              Show More Sources ({analysis.length - displayCount} remaining)
            </button>
          </motion.div>
        )}

        {/* Show Less Button (when expanded) */}
        {displayCount > 10 && displayCount >= analysis.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center pt-4"
          >
            <button
              onClick={() => setDisplayCount(10)}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              Show Less
            </button>
          </motion.div>
        )}
      </div>

      {/* Detailed Methodology */}
      <Card className="p-6 bg-muted/50">
        <h4 className="font-bold mb-4 text-lg flex items-center gap-2">
          🔍 Trust Score Methodology
        </h4>
        
        <div className="space-y-4 text-sm">
          {/* Scoring Criteria */}
          <div>
            <h5 className="font-semibold mb-2 text-base">Scoring Criteria (Starting from 50 points):</h5>
            <div className="grid gap-2 ml-2">
              <div className="flex items-start gap-2">
                <span className="font-mono text-green-600">+30</span>
                <span><strong>Domain Authority:</strong> .edu (educational), .gov (government), .org (non-profit) domains indicate institutional backing</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-green-600">+20</span>
                <span><strong>Reference Source:</strong> Established encyclopedias with editorial oversight (Wikipedia, Britannica)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-green-600">+15</span>
                <span><strong>Reputable Publisher:</strong> Known news organizations, peer-reviewed journals, established financial publications</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-green-600">+10</span>
                <span><strong>Transport Security:</strong> HTTPS encryption ensures data integrity and authenticity</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-green-600">+5</span>
                <span><strong>URL Structure:</strong> Deep links to specific content vs. generic homepage</span>
              </div>
            </div>
          </div>

          {/* Reliability Levels */}
          <div>
            <h5 className="font-semibold mb-2 text-base">Reliability Levels:</h5>
            <div className="grid gap-2">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-green-600 mt-0.5" />
                <span><strong>High (70-100):</strong> Multiple positive indicators—institutional domain, encryption, reputable publisher</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <span><strong>Medium (50-69):</strong> Standard commercial sources with basic security measures</span>
              </div>
              <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                <span><strong>Low (&lt;50):</strong> Limited verification, lack of security, or unrecognized sources</span>
              </div>
            </div>
          </div>

          {/* Limitations */}
          <div className="pt-3 border-t border-gray-300">
            <h5 className="font-semibold mb-2 text-base text-orange-700 dark:text-orange-400">
              ⚠️ Important Limitations:
            </h5>
            <ul className="space-y-1 ml-2 text-muted-foreground list-disc list-inside">
              <li><strong>URL-based analysis only:</strong> We analyze domain patterns and structure, not the actual content</li>
              <li><strong>No content verification:</strong> A high score doesn't guarantee accuracy of the specific article</li>
              <li><strong>Heuristic approach:</strong> Scoring uses established trust patterns, not real-time fact-checking</li>
              <li><strong>Includes all external links:</strong> Analysis covers citations, external resources, and supplementary links from the Wikipedia page</li>
              <li><strong>Wikipedia curation:</strong> All links went through Wikipedia's editorial review process</li>
            </ul>
          </div>

          {/* Best Practice */}
          <div className="pt-3 border-t border-gray-300 bg-green-50 dark:bg-green-950 p-3 rounded-lg">
            <h5 className="font-semibold mb-1 text-green-800 dark:text-green-200">
              💡 Best Practice:
            </h5>
            <p className="text-green-700 dark:text-green-300">
              Always cross-reference information from multiple sources, especially for financial decisions. 
              Use this tool as a starting point for evaluating source credibility, not as the final word.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}