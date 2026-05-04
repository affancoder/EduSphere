"use client";

import { motion } from "framer-motion";
import GoldButton from "./ui/GoldButton";

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40 scale-105"
        >
          <source src="/hero-section.mp4" type="video/mp4" />
        </video>
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-linear-to-b from-background via-transparent to-background" />
        <div className="absolute inset-0 bg-linear-to-r from-background/60 via-transparent to-background/60" />
      </div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-6 relative z-10 text-center"
      >
        <motion.div variants={itemVariants} className="inline-block mb-6">
          <span className="px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs tracking-[0.2em] uppercase font-body">
            The Future of Elite Learning
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="font-display text-5xl md:text-7xl lg:text-8xl mb-8 leading-[1.1] max-w-5xl mx-auto"
        >
          Master Your Craft in a <br />
          <span className="text-gold italic">Digital Sanctuary</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="font-body text-text-muted text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          EduSphere brings together the world&apos;s leading minds to provide an
          unparalleled learning experience for the next generation of visionaries.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <GoldButton className="px-10 py-4 text-base">
            Explore Curriculums
          </GoldButton>
          <GoldButton variant="ghost" className="px-10 py-4 text-base">
            Meet the Mentors
          </GoldButton>
        </motion.div>
      </motion.div>

      {/* Decorative Bottom Line */}
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 1.5, delay: 1 }}
        className="absolute bottom-0 left-0 h-px bg-linear-to-r from-transparent via-gold/30 to-transparent"
      />
    </section>
  );
}
