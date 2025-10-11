"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Brain, Network, ShieldCheck, ArrowLeft } from "lucide-react";
import SummaryPanel from "./SummaryPanel";
import QuizPanel from "./QuizPanel";
import ConceptGraph from "./ConceptGraph";
import TrustMeter from "./TrustMeter";
import { motion } from "framer-motion";

interface ArticleData {
  title: string;
  pageId: number;
  fullText: string;
  sections: string[];
  relatedLinks: string[];
  externalLinks: string[];
}

interface ArticleDisplayProps {
  article: ArticleData;
  onNewSearch: (query: string) => void;
}

export default function ArticleDisplay({ article, onNewSearch }: ArticleDisplayProps) {
  const [activeTab, setActiveTab] = useState("summary");

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
          <button
            onClick={() => onNewSearch("")}
            className="encarta-button flex items-center gap-2"
          >
            <ArrowLeft className="w-3 h-3" />
            New Search
          </button>
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
              <TabsTrigger value="quiz" className="encarta-tab flex items-center gap-2">
                <Brain className="w-3 h-3" />
                MindMaze
              </TabsTrigger>
              <TabsTrigger value="graph" className="encarta-tab flex items-center gap-2">
                <Network className="w-3 h-3" />
                Concept Map
              </TabsTrigger>
              <TabsTrigger value="trust" className="encarta-tab flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" />
                Trust Meter
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 bg-white">
            <TabsContent value="summary" className="mt-0">
              <SummaryPanel text={article.fullText} title={article.title} />
            </TabsContent>

            <TabsContent value="quiz" className="mt-0">
              <QuizPanel text={article.fullText} title={article.title} />
            </TabsContent>

            <TabsContent value="graph" className="mt-0">
              <ConceptGraph
                title={article.title}
                relatedLinks={article.relatedLinks}
              />
            </TabsContent>

            <TabsContent value="trust" className="mt-0">
              <TrustMeter links={article.externalLinks} />
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