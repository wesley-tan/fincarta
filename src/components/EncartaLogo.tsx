"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function EncartaLogo() {

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🏠 Logo clicked - navigating to home");

    // Force a clean navigation to home page without any search params
    window.location.href = "/";
  };

  return (
    <Link
      href="/"
      className="flex items-center gap-4"
      onClick={handleLogoClick}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4"
      >
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center"
          style={{
            borderTop: "3px solid #FFFFFF",
            borderLeft: "3px solid #FFFFFF",
            borderRight: "3px solid #808080",
            borderBottom: "3px solid #808080",
          }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <div className="w-4 h-4 bg-gray-800" />
          </div>
        </motion.div>
        <div>
          <h1 className="text-5xl font-bold text-white retro-pixel-font" style={{ textShadow: "3px 3px 0 rgba(0,0,0,0.5)" }}>
            FIN<span className="text-green-300">CARTA</span>
          </h1>
          <p className="text-xs text-white mt-1 font-bold tracking-wider">YOUR AI FINANCIAL EDUCATION ENCYCLOPEDIA</p>
        </div>
      </motion.div>
    </Link>
  );
}