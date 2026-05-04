"use client";

import { motion } from "framer-motion";

const mentors = [
  {
    name: "Dr. Alistair Vance",
    role: "Quantum Computing Expert",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Elena Rodriguez",
    role: "Former Creative Director at Apple",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Marcus Thorne",
    role: "Venture Capitalist & Strategist",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop",
  },
];

export default function MentorsSection() {
  return (
    <section className="py-28 px-6 bg-background overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-gold text-xs tracking-[0.3em] uppercase font-body mb-4"
          >
            The Council
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-5xl md:text-6xl text-text-primary"
          >
            World-Class <span className="text-gold italic">Mentors</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {mentors.map((mentor, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.8 }}
              className="group text-center"
            >
              <div className="relative mb-8 inline-block">
                {/* Decorative rings */}
                <div className="absolute inset-0 border border-gold/20 rounded-full -m-4 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 border border-gold/10 rounded-full -m-8 group-hover:scale-125 transition-transform duration-1000" />
                
                <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-2 border-gold/30 p-1 bg-background relative z-10">
                  <img
                    src={mentor.image}
                    alt={mentor.name}
                    className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                </div>
              </div>
              <h3 className="font-display text-2xl text-text-primary mb-1">
                {mentor.name}
              </h3>
              <p className="font-body text-sm text-text-muted tracking-wide uppercase">
                {mentor.role}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
