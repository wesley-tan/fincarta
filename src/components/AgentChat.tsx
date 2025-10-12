"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Mic, Volume2, VolumeX } from "lucide-react";
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
      content: `Hi! I'm your AI assistant for this article about ${articleTitle}. I can answer any questions you have about the content. Just ask me anything, or use the microphone to speak your question!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [conversationId, setConversationId] = useState<string>("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const hasPlayedGreeting = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Helper function to stop current audio
  const stopCurrentAudio = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        // Remove event listeners to prevent them from firing
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
      } catch (e) {
        console.error("Error stopping audio:", e);
      }
      audioRef.current = null;
      setIsSpeaking(false);
    }
  };

  // Play greeting voice on load
  useEffect(() => {
    if (!hasPlayedGreeting.current && voiceEnabled) {
      hasPlayedGreeting.current = true;
      playGreeting();
    }
  }, [voiceEnabled]);

  // Stop audio when voice is disabled (muted)
  useEffect(() => {
    if (!voiceEnabled) {
      stopCurrentAudio();
    }
  }, [voiceEnabled]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopCurrentAudio();
    };
  }, []);

  const playGreeting = async () => {
    try {
      const response = await fetch("/api/agent/greeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleTitle }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audio) {
          playAudio(data.audio);
        }
      }
    } catch (error) {
      console.error("Failed to play greeting:", error);
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = async (audioBase64: string) => {
    if (!voiceEnabled) return;

    try {
      // Stop any currently playing audio to prevent overlap
      stopCurrentAudio();

      const audioBlob = new Blob(
        [Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))],
        { type: "audio/mpeg" }
      );
      const audioUrl = URL.createObjectURL(audioBlob);

      const newAudio = new Audio(audioUrl);
      audioRef.current = newAudio;

      // Set speaking state
      setIsSpeaking(true);

      newAudio.onended = () => {
        if (audioRef.current === newAudio) {
          setIsSpeaking(false);
        }
        // Clean up the URL after playback
        URL.revokeObjectURL(audioUrl);
      };

      newAudio.onerror = (e) => {
        console.error("Audio playback error:", e);
        if (audioRef.current === newAudio) {
          setIsSpeaking(false);
        }
        URL.revokeObjectURL(audioUrl);
      };

      // Use async play to catch errors
      await newAudio.play();
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsSpeaking(false);
    }
  };

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
          messages: [...messages, userMessage],
          articleContext: {
            title: articleTitle,
            text: articleText,
          },
          conversationId,
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
      setConversationId(data.conversationId);

      // Play audio response if voice is enabled
      if (data.audio && voiceEnabled) {
        playAudio(data.audio);
      }
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
        <span className="encarta-window-title">🤖 AI Voice Assistant</span>
        <div className="flex items-center gap-2 text-xs text-white px-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="flex items-center gap-1 hover:bg-white/20 px-2 py-1 rounded"
            title={voiceEnabled ? "Disable voice" : "Enable voice"}
          >
            {voiceEnabled ? (
              <Volume2 className="w-3 h-3" />
            ) : (
              <VolumeX className="w-3 h-3" />
            )}
          </button>
          <span className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-blue-400' : 'bg-green-400'} animate-pulse`} />
            {isSpeaking ? "Speaking..." : "Online"}
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
              placeholder={isRecording ? "Listening..." : "Ask me anything or click the mic..."}
              className="w-full px-3 py-2 text-sm bg-white"
              disabled={loading || isRecording}
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
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={loading}
            className={`encarta-button px-3 flex items-center gap-2 ${
              isRecording ? "bg-red-500 text-white" : ""
            }`}
            title={isRecording ? "Stop recording" : "Start voice input"}
          >
            <Mic className={`w-4 h-4 ${isRecording ? "animate-pulse" : ""}`} />
          </button>
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

