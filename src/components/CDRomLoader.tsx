"use client";

import { motion } from "framer-motion";
import { Disc3 } from "lucide-react";

export default function CDRomLoader() {
  return (
    <div>
      <div className="encarta-window-titlebar">
        <span className="encarta-window-title">💿 Loading from CD-ROM...</span>
        <div className="encarta-window-controls">
          <div className="encarta-window-btn">_</div>
          <div className="encarta-window-btn">□</div>
          <div className="encarta-window-btn">×</div>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center gap-6 p-16 bg-white"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Disc3 className="w-20 h-20 text-blue-600" />
        </motion.div>
        <div className="text-center">
          <motion.p
            className="text-lg font-bold retro-pixel-font"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            LOADING FROM CD-ROM...
          </motion.p>
          <p className="text-xs text-gray-600 mt-2 font-bold">Please wait while FinCarta retrieves your article</p>
        </div>
        <div className="w-64 h-4 bg-white" style={{
          borderTop: "2px solid #808080",
          borderLeft: "2px solid #808080",
          borderRight: "2px solid #FFFFFF",
          borderBottom: "2px solid #FFFFFF",
        }}>
          <motion.div
            className="h-full bg-blue-600"
            animate={{ width: ["0%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
      <div className="encarta-status-bar">
        <div className="encarta-status-panel">Reading article data...</div>
      </div>
    </div>
  );
}