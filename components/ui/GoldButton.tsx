"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GoldButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "filled" | "ghost";
  onClick?: () => void;
}

export default function GoldButton({
  children,
  className = "",
  variant = "filled",
  onClick,
}: GoldButtonProps) {
  const baseStyles =
    "rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 font-body";
  
  const variants = {
    filled: "bg-gold text-background hover:bg-champagne",
    ghost:
      "border border-gold/30 text-champagne hover:border-gold/60 hover:bg-gold/5",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
