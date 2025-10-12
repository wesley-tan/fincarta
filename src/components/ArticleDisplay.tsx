"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Brain, Network, ShieldCheck, ArrowLeft, Bot, Share2, Check } from "lucide-react";
import SummaryPanel from "./SummaryPanel";
import TrustMeter from "./TrustMeter";
import AgentChat from "./AgentChat";
import { motion, AnimatePresence } from "framer-motion";

interface ArticleData {
  title: string;
  pageId: number;
  fullText: string;
  sections: string[];
  relatedLinks: string[];
  externalLinks: string[];
  isFinanceRelated?: boolean;
  financeMessage?: string;
}

interface ArticleDisplayProps {
  article: ArticleData;
  onNewSearch: (query: string) => void;
}

export default function ArticleDisplay({ article, onNewSearch }: ArticleDisplayProps) {
  const [activeTab, setActiveTab] = useState("summary");
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/?search=${encodeURIComponent(article.title)}`;
    const shareData = {
      title: `${article.title} - FinCarta`,
      text: `Check out this financial topic on FinCarta: ${article.title}`,
      url: shareUrl,
    };

    // Try native share API first (mobile/modern browsers)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // User cancelled or error - fall through to clipboard
        if ((err as Error).name !== 'AbortError') {
          console.log('Share failed, falling back to clipboard');
        }
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="encarta-window"
      >
        <div className="encarta-window-titlebar">
          <span className="encarta-window-title">📚 {article.title.toUpperCase()}</span>
          <div className="encarta-window-controls">
            <div className="encarta-window-btn">_</div>
            <div className="encarta-window-btn">□</div>
            <div className="encarta-window-btn">×</div>
          </div>
        </div>
        <div className="p-4 bg-white flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold retro-pixel-font">{article.title}</h1>
            <p className="text-xs text-gray-600 mt-1 font-bold">
              Wikipedia Article • {article.fullText.length} characters • {article.sections.length} sections
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={handleShare}
                className="encarta-button flex items-center gap-2"
                title="Share this article"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="w-3 h-3" />
                    Share
                  </>
                )}
              </button>
              <AnimatePresence>
                {copied && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-[#000080] text-white text-xs px-3 py-1 rounded whitespace-nowrap z-10"
                    style={{
                      borderTop: "2px solid #FFFFFF",
                      borderLeft: "2px solid #FFFFFF",
                      borderRight: "2px solid #808080",
                      borderBottom: "2px solid #808080",
                    }}
                  >
                    Link copied to clipboard!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={() => onNewSearch("")}
              className="encarta-button flex items-center gap-2"
            >
              <ArrowLeft className="w-3 h-3" />
              New Search
            </button>
          </div>
        </div>
        <div className="encarta-status-bar">
          <div className="encarta-status-panel">Article loaded</div>
          <div className="encarta-status-panel">Page ID: {article.pageId}</div>
        </div>
      </motion.div>

      {/* Main Content Tabs */}
      <div className="encarta-window">
        <div className="encarta-window-titlebar">
          <span className="encarta-window-title">📖 Article Viewer</span>
          <div className="encarta-window-controls">
            <div className="encarta-window-btn">_</div>
            <div className="encarta-window-btn">□</div>
            <div className="encarta-window-btn">×</div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="encarta-toolbar bg-[#DFDFDF] border-b-2 border-[#808080]">
            <TabsList className="bg-transparent border-0 p-0 h-auto flex gap-0">
              <TabsTrigger value="summary" className="encarta-tab flex items-center gap-2">
                <BookOpen className="w-3 h-3" />
                AI Summary
              </TabsTrigger>
              <TabsTrigger value="trust" className="encarta-tab flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" />
                Trust Meter
              </TabsTrigger>
              <TabsTrigger value="agent" className="encarta-tab flex items-center gap-2">
                <Bot className="w-3 h-3" />
                AI Assistant
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 bg-white">
            <TabsContent value="summary" className="mt-0">
              <SummaryPanel text={article.fullText} title={article.title} pageId={article.pageId} />
            </TabsContent>

            <TabsContent value="trust" className="mt-0">
              <TrustMeter links={article.externalLinks} />
            </TabsContent>

            <TabsContent value="agent" className="mt-0">
              <AgentChat 
                articleTitle={article.title}
                articleText={article.fullText}
              />
            </TabsContent>
          </div>
        </Tabs>
        
        <div className="encarta-status-bar">
          <div className="encarta-status-panel">Viewing: {activeTab}</div>
        </div>
      </div>
    </div>
  );
}