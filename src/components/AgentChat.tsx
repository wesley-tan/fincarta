"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "agent";
  content: string;
  timestamp: Date;
}

interface AgentChatProps {
  articleTitle: string;
  articleText: string;
}

export default function AgentChat({ articleTitle, articleText }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      content: `Hi! I'm your AI assistant for this article about ${articleTitle}. Ask me anything!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input.trim(),
          articleContext: {
            title: articleTitle,
            text: articleText,
            summary: articleText.substring(0, 500),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const agentMessage: Message = {
        role: "agent",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: "agent",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-[#F0F0F0]">
      {/* Header */}
      <div className="encarta-window-titlebar">
        <span className="encarta-window-title">🤖 AI Assistant</span>
        <div className="flex items-center gap-2 text-xs text-white px-2">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Online
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{
        background: "linear-gradient(180deg, #F0F0F0 0%, #FFFFFF 100%)",
      }}>
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex gap-3 ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === "agent" 
                  ? "bg-gradient-to-br from-blue-500 to-purple-600"
                  : "bg-gradient-to-br from-green-500 to-teal-600"
              }`}>
                {message.role === "agent" ? (
                  <Bot className="w-5 h-5 text-white" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              
              <div className={`flex-1 max-w-[75%] ${
                message.role === "user" ? "text-right" : "text-left"
              }`}>
                <div className={`inline-block px-4 py-2 rounded-lg ${
                  message.role === "agent"
                    ? "bg-white border-2 border-[#808080]"
                    : "bg-[#000080] text-white"
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1 px-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white border-2 border-[#808080] rounded-lg px-4 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="encarta-status-bar">
        <form onSubmit={handleSubmit} className="flex gap-2 p-2 w-full">
          <div className="flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about this article..."
              className="w-full px-3 py-2 text-sm bg-white"
              disabled={loading}
              style={{
                borderTop: "2px solid #808080",
                borderLeft: "2px solid #808080",
                borderRight: "2px solid #FFFFFF",
                borderBottom: "2px solid #FFFFFF",
                fontFamily: "'MS Sans Serif', Arial, sans-serif",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="encarta-button px-4 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}

