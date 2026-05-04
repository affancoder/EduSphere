"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

export default function Card({ children, className = "", animate = true }: CardProps) {
  const baseStyles = "bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden";
  
  if (!animate) {
    return <div className={`${baseStyles} ${className}`}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`${baseStyles} ${className}`}
    >
      {children}
    </motion.div>
  );
}
