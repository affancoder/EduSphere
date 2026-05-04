"use client";

import { motion } from "framer-motion";
import GoldButton from "../ui/GoldButton";

export default function CTABanner() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden bg-surface border border-gold/20 p-12 md:p-20 text-center"
        >
          {/* Abstract background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full -ml-32 -mb-32" />

          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-4xl md:text-6xl text-text-primary mb-8 leading-tight"
            >
              Ready to redefine your <br />
              <span className="text-gold italic">intellectual boundary?</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-body text-text-muted text-lg max-w-2xl mx-auto mb-12"
            >
              Join a community of elite learners and industry pioneers. Your journey
              towards mastery begins with a single step.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <GoldButton className="px-12 py-4 text-base">
                Begin Application
              </GoldButton>
              <button className="text-text-primary font-body text-sm tracking-widest uppercase hover:text-gold transition-colors">
                Request a Brochure
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
