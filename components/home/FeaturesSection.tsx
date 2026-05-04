"use client";

import { motion } from "framer-motion";
import { Brain, Video, Users, Trophy } from "lucide-react";

const features = [
  {
    number: "01",
    icon: <Brain className="w-6 h-6 text-gold stroke-[1.5]" />,
    title: "AI-Powered Explanations",
    description:
      "Ask any doubt and receive clear, structured explanations with examples and a quiz.",
  },
  {
    number: "02",
    icon: <Video className="w-6 h-6 text-gold stroke-[1.5]" />,
    title: "Expert-Led Courses",
    description:
      "Learn from industry professionals with real-world experience and structured curricula.",
  },
  {
    number: "03",
    icon: <Users className="w-6 h-6 text-gold stroke-[1.5]" />,
    title: "Live Mentorship",
    description:
      "Connect 1-on-1 with mentors for personalized guidance on your learning journey.",
  },
  {
    number: "04",
    icon: <Trophy className="w-6 h-6 text-gold stroke-[1.5]" />,
    title: "Track Your Progress",
    description:
      "Visual dashboards, streaks, and certificates to keep you accountable and motivated.",
  },
];

export default function FeaturesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="py-28 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs tracking-[0.2em] uppercase font-body mb-6"
          >
            Why EduSphere
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-5xl md:text-6xl font-light text-text-primary"
          >
            Learning, <span className="text-gold italic">Elevated</span>
          </motion.h2>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.number}
              variants={cardVariants}
              className="group relative bg-surface border border-white/5 rounded-2xl p-8 hover:border-gold/20 transition-all duration-300 overflow-hidden"
            >
              {/* Decorative Number */}
              <div className="absolute top-4 right-6 font-display font-bold text-7xl md:text-8xl text-[#1E1E28] select-none group-hover:text-gold/5 transition-colors duration-500">
                {feature.number}
              </div>

              {/* Icon */}
              <div className="relative z-10 w-12 h-12 rounded-xl bg-gold/5 border border-gold/10 flex items-center justify-center mb-6 group-hover:border-gold/30 transition-colors">
                {feature.icon}
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="font-display text-2xl text-text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="font-body text-sm text-text-muted leading-relaxed max-w-sm">
                  {feature.description}
                </p>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute -bottom-1 -right-1 w-24 h-24 bg-gold/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
