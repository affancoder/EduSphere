"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles, Loader2, Save, CheckCircle, MessageSquareQuote } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "../../components/Footer";
import Card from "@/components/ui/Card";
import GoldButton from "@/components/ui/GoldButton";

const subjects = ["JavaScript", "DSA", "React"];

export default function AskDoubtPage() {
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState(subjects[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<null | {
    explanation: string;
    example: string;
    quiz: string[];
  }>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setResult(null);

    // Mock API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setResult({
      explanation: "In JavaScript, a closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment). In other words, a closure gives you access to an outer function's scope from an inner function.",
      example: "function makeAdder(x) {\n  return function(y) {\n    return x + y;\n  };\n}\n\nconst add5 = makeAdder(5);\nconsole.log(add5(2)); // 7",
      quiz: [
        "What is the primary benefit of using closures?",
        "How do closures relate to lexical scoping?",
        "Can a closure access variables from its own scope?",
      ],
    });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-text-primary font-body">
      <Navbar />

      <main className="container mx-auto px-6 pt-32 pb-20">
        {/* Page Header */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl mb-4"
          >
            Ask Your <span className="text-gold italic">Doubt</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text-muted text-lg max-w-2xl mx-auto"
          >
            Get instant AI-powered explanations from our elite knowledge base.
          </motion.p>
        </div>

        {/* Input Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gold mb-2 tracking-widest uppercase">
                  Subject
                </label>
                <div className="relative">
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 appearance-none focus:outline-none focus:border-gold/50 transition-colors cursor-pointer"
                  >
                    {subjects.map((s) => (
                      <option key={s} value={s} className="bg-surface">
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gold mb-2 tracking-widest uppercase">
                  Your Question
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your question..."
                  className="w-full min-h-[150px] bg-white/5 border border-white/10 rounded-lg px-4 py-4 focus:outline-none focus:border-gold/50 transition-colors resize-none placeholder:text-text-muted/50"
                />
              </div>

              <GoldButton
                variant="filled"
                className="w-full py-4 text-base tracking-widest uppercase"
                onClick={() => {}} // Form handles submit
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Answer...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Get Explanation
                  </>
                )}
              </GoldButton>
            </form>
          </Card>
        </div>

        {/* Loading State */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin mb-4" />
              <p className="text-gold font-body tracking-widest uppercase text-sm">
                Analyzing request...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Section */}
        <AnimatePresence>
          {result && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Explanation Card */}
                <Card className="p-8">
                  <div className="flex items-center gap-3 mb-4 text-gold">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="font-display text-2xl">Explanation</h3>
                  </div>
                  <p className="text-text-primary leading-relaxed">
                    {result.explanation}
                  </p>
                </Card>

                {/* Example Card */}
                <Card className="p-8">
                  <div className="flex items-center gap-3 mb-4 text-gold">
                    <MessageSquareQuote className="w-5 h-5" />
                    <h3 className="font-display text-2xl">Example</h3>
                  </div>
                  <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto text-sm font-mono text-champagne leading-relaxed">
                    {result.example}
                  </pre>
                </Card>
              </div>

              {/* Quiz Card */}
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6 text-gold">
                  <CheckCircle className="w-5 h-5" />
                  <h3 className="font-display text-2xl">Quick Assessment</h3>
                </div>
                <div className="space-y-4">
                  {result.quiz.map((q, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/5 hover:border-gold/20 transition-colors"
                    >
                      <span className="shrink-0 w-6 h-6 rounded-full bg-gold/10 text-gold text-xs flex items-center justify-center border border-gold/20">
                        {i + 1}
                      </span>
                      <p className="text-text-primary text-sm">{q}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                <GoldButton variant="filled" className="px-8 py-3 w-full sm:w-auto">
                  <Save className="w-4 h-4" />
                  Save Doubt
                </GoldButton>
                <GoldButton variant="ghost" className="px-8 py-3 w-full sm:w-auto">
                  Mark as Understood
                </GoldButton>
                <button className="text-text-muted hover:text-gold transition-colors text-sm font-body tracking-widest uppercase flex items-center gap-2">
                  Explain Simpler
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
