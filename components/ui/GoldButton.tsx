"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GoldButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "filled" | "ghost";
  onClick?: () => void;
  disabled?: boolean;
}

export default function GoldButton({
  children,
  className = "",
  variant = "filled",
  onClick,
  disabled = false,
}: GoldButtonProps) {
  const baseStyles =
    "rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 font-body";
  
  const variants = {
    filled: "bg-gold text-background hover:bg-champagne disabled:opacity-50 disabled:cursor-not-allowed",
    ghost:
      "border border-gold/30 text-champagne hover:border-gold/60 hover:bg-gold/5 disabled:opacity-50 disabled:cursor-not-allowed",
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
