"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="w-full max-w-3xl"
    >
      <div className="encarta-window">
        <div className="encarta-window-titlebar">
          <span className="encarta-window-title">💰 Financial Education Search</span>
          <div className="encarta-window-controls">
            <div className="encarta-window-btn">_</div>
            <div className="encarta-window-btn">□</div>
            <div className="encarta-window-btn">×</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 bg-white p-1" style={{
                borderTop: "2px solid #808080",
                borderLeft: "2px solid #808080",
                borderRight: "2px solid #FFFFFF",
                borderBottom: "2px solid #FFFFFF",
              }}>
                <Search className="w-4 h-4 text-gray-600 ml-1" />
                <input
                  type="text"
                  placeholder="Search financial topics... (e.g. 'Compound Interest', 'Budgeting')"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-0 outline-none text-sm px-2 py-2 font-sans"
                  disabled={loading}
                  style={{ fontFamily: "'MS Sans Serif', Arial, sans-serif" }}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="encarta-button min-w-[100px] h-[36px]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Searching...
                </span>
              ) : (
                "Search"
              )}
            </button>
          </div>
        </form>
        <div className="encarta-status-bar">
          <div className="encarta-status-panel">Ready</div>
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {["Compound Interest", "Stock Market", "Cryptocurrency", "Budgeting", "Credit Score", "401k", "Index Funds", "Inflation"].map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => {
              setQuery(suggestion);
              onSearch(suggestion);
            }}
            className="encarta-button text-xs"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </motion.div>
  );
}