"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles, Loader2, Save, CheckCircle, MessageSquareQuote } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/ui/Card";
import GoldButton from "@/components/ui/GoldButton";

const subjects = ["JavaScript", "DSA", "React"];

export default function AskDoubtPage() {
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState(subjects[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    explanation: string;
    example: string;
    quiz: string[];
  }>(null);

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, subject }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult({
          explanation: data.explanation,
          example: data.example,
          quiz: data.quiz,
        });
      } else {
        alert(data.error || "Failed to get an explanation. Please try again.");
      }
    } catch (err) {
      console.error("Ask doubt error:", err);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDoubt = () => {
    alert("Doubt has been automatically saved to your history!");
  };

  const handleMarkAsUnderstood = () => {
    setResult(null);
    setQuestion("");
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-text-primary font-body">
      <Navbar />

      <main className="container mx-auto px-6 pt-32 pb-20">
        {/* Page Header */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl mb-4"
          >
            Learnify <span className="text-[#d4af37] italic">Doubt Solver</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text-muted text-lg max-w-2xl mx-auto"
          >
            Get instant, premium explanations for your toughest questions.
          </motion.p>
        </div>

        {/* Input Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <Card className="p-8 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#d4af37] mb-2 tracking-widest uppercase">
                  Select Subject
                </label>
                <div className="relative">
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-[#d4af37]/50 transition-colors cursor-pointer text-text-primary"
                  >
                    {subjects.map((s) => (
                      <option key={s} value={s} className="bg-[#0b0b0f]">
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#d4af37] mb-2 tracking-widest uppercase">
                  Describe your doubt
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. How do closures work in JavaScript?"
                  className="w-full min-h-[150px] bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-[#d4af37]/50 transition-colors resize-none placeholder:text-text-muted/50 text-text-primary"
                />
              </div>

              <GoldButton
                variant="filled"
                className="w-full py-4 text-base tracking-widest uppercase bg-[#d4af37] text-[#0b0b0f] hover:bg-[#d4af37]/90 rounded-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
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

        {/* Loading UI */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="w-12 h-12 border-4 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin mb-4" />
              <p className="text-[#d4af37] font-body tracking-widest uppercase text-xs">
                Learnify AI is thinking...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Section */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Explanation Card */}
                <Card className="p-8 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                  <div className="flex items-center gap-3 mb-4 text-[#d4af37]">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="font-display text-2xl">Explanation</h3>
                  </div>
                  <p className="text-text-primary leading-relaxed">
                    {result.explanation}
                  </p>
                </Card>

                {/* Example Card */}
                <Card className="p-8 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                  <div className="flex items-center gap-3 mb-4 text-[#d4af37]">
                    <MessageSquareQuote className="w-5 h-5" />
                    <h3 className="font-display text-2xl">Example</h3>
                  </div>
                  <pre className="bg-black/40 p-4 rounded-xl overflow-x-auto text-sm font-mono text-champagne leading-relaxed border border-white/5">
                    {result.example}
                  </pre>
                </Card>
              </div>

              {/* Quiz Card */}
              <Card className="p-8 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <div className="flex items-center gap-3 mb-6 text-[#d4af37]">
                  <CheckCircle className="w-5 h-5" />
                  <h3 className="font-display text-2xl">Practice Quiz</h3>
                </div>
                <div className="space-y-4">
                  {result.quiz.map((q, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-[#d4af37]/20 transition-colors"
                    >
                      <span className="shrink-0 w-6 h-6 rounded-full bg-[#d4af37]/10 text-[#d4af37] text-xs flex items-center justify-center border border-[#d4af37]/20">
                        {i + 1}
                      </span>
                      <p className="text-text-primary text-sm">{q}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                <GoldButton 
                  variant="filled" 
                  className="px-8 py-3 w-full sm:w-auto bg-[#d4af37] text-[#0b0b0f] rounded-xl"
                  onClick={handleSaveDoubt}
                >
                  <Save className="w-4 h-4" />
                  Save Doubt
                </GoldButton>
                
                <GoldButton 
                  variant="ghost" 
                  className="px-8 py-3 w-full sm:w-auto border-[#d4af37]/30 text-[#d4af37] rounded-xl"
                  onClick={handleMarkAsUnderstood}
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Understood
                </GoldButton>

                <button 
                  onClick={() => handleSubmit()}
                  className="text-text-muted hover:text-[#d4af37] transition-colors text-sm font-medium underline underline-offset-4"
                >
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
