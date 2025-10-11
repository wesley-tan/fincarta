"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EncartaLogo from "@/components/EncartaLogo";
import BubbleBackground from "@/components/BubbleBackground";
import SearchBar from "@/components/SearchBar";
import CDRomLoader from "@/components/CDRomLoader";
import ArticleDisplay from "@/components/ArticleDisplay";
import { motion, AnimatePresence } from "framer-motion";

interface ArticleData {
  title: string;
  pageId: number;
  fullText: string;
  sections: string[];
  relatedLinks: string[];
  externalLinks: string[];
}

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle search from URL params (when coming from roadmap)
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  }, [searchParams]);

  const handleSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    setArticle(null);

    // Track search in localStorage
    const lastSearches = JSON.parse(localStorage.getItem("last-searches") || "[]");
    lastSearches.unshift(query);
    localStorage.setItem("last-searches", JSON.stringify(lastSearches.slice(0, 20)));

    // Track article read
    const articlesRead = JSON.parse(localStorage.getItem("articles-read") || "[]");
    if (!articlesRead.includes(query)) {
      articlesRead.push(query);
      localStorage.setItem("articles-read", JSON.stringify(articlesRead));
    }

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch article");
      }

      const data = await response.json();
      setArticle(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen encarta-bg relative overflow-hidden">
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
                className="encarta-tab"
                data-state="active"
              >
                🔍 Reference Mode
              </button>
              <button
                onClick={() => router.push("/roadmap")}
                className="encarta-tab"
                data-state="inactive"
              >
                🎓 Learn Mode
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 pb-16">
          <AnimatePresence mode="wait">
            {!article && !loading && (
              <motion.div
                key="search"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-8"
              >
                <SearchBar onSearch={handleSearch} loading={loading} />
                
                {error && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="encarta-window max-w-md"
                  >
                    <div className="encarta-window-titlebar">
                      <span className="encarta-window-title">⚠️ Error</span>
                      <div className="encarta-window-controls">
                        <div className="encarta-window-btn">×</div>
                      </div>
                    </div>
                    <div className="p-6 bg-white text-center">
                      <p className="text-red-600 font-bold text-sm">ERROR: {error}</p>
                      <p className="text-xs text-gray-600 mt-2">
                        Please try a different search term
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="encarta-window max-w-2xl mx-auto"
              >
                <CDRomLoader />
              </motion.div>
            )}

            {article && !loading && (
              <motion.div
                key="article"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ArticleDisplay article={article} onNewSearch={handleSearch} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}