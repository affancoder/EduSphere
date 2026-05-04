"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Filter,
  MoreVertical,
  Inbox
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "../../components/Footer";
import Card from "@/components/ui/Card";
import GoldButton from "@/components/ui/GoldButton";

const initialDoubts = [
  {
    id: 1,
    question: "How do closures work in JavaScript?",
    preview: "Closures are a fundamental concept where an inner function has access to the outer function's scope...",
    subject: "JavaScript",
    status: "Understood",
    date: "May 2, 2026",
  },
  {
    id: 2,
    question: "Difference between SQL and NoSQL databases?",
    preview: "SQL databases are relational and use structured query language, while NoSQL are non-relational...",
    subject: "Databases",
    status: "Pending",
    date: "May 1, 2026",
  },
  {
    id: 3,
    question: "What is the Big O complexity of MergeSort?",
    preview: "MergeSort consistently performs at O(n log n) for all cases (best, average, and worst)...",
    subject: "DSA",
    status: "Understood",
    date: "April 30, 2026",
  },
  {
    id: 4,
    question: "How to handle side effects in React components?",
    preview: "The useEffect hook is the primary way to manage side effects like data fetching or subscriptions...",
    subject: "React",
    status: "Pending",
    date: "April 28, 2026",
  },
];

export default function HistoryPage() {
  const [doubts, setDoubts] = useState(initialDoubts);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = (id: number) => {
    setDoubts(doubts.filter((d) => d.id !== id));
  };

  const handleToggleStatus = (id: number) => {
    setDoubts(
      doubts.map((d) =>
        d.id === id
          ? { ...d, status: d.status === "Understood" ? "Pending" : "Understood" }
          : d
      )
    );
  };

  const filteredDoubts = doubts.filter((d) =>
    d.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-text-primary font-body">
      <Navbar />

      <main className="container mx-auto px-6 pt-32 pb-20">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-display text-4xl md:text-5xl text-text-primary mb-2"
            >
              Your Doubts <span className="text-gold italic">History</span>
            </motion.h1>
            <p className="text-text-muted">Review and manage your past learning inquiries.</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search doubts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
            <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-text-muted hover:text-gold transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Doubts List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredDoubts.length > 0 ? (
              filteredDoubts.map((doubt) => (
                <motion.div
                  key={doubt.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-6 group hover:border-gold/20 transition-all duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 rounded bg-gold/10 text-gold border border-gold/20">
                            {doubt.subject}
                          </span>
                          <span className="text-xs text-text-muted">{doubt.date}</span>
                        </div>
                        <h3 className="font-display text-2xl text-text-primary mb-2 group-hover:text-gold transition-colors">
                          {doubt.question}
                        </h3>
                        <p className="text-sm text-text-muted line-clamp-1 max-w-2xl">
                          {doubt.preview}
                        </p>
                      </div>

                      <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
                        <div className="flex items-center gap-2 mr-4">
                          <span className={`flex h-2 w-2 rounded-full ${doubt.status === 'Understood' ? 'bg-emerald-500' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} />
                          <span className={`text-[10px] tracking-widest uppercase font-semibold ${doubt.status === 'Understood' ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {doubt.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button className="p-2 rounded-lg bg-white/5 border border-white/5 text-text-muted hover:text-gold hover:bg-gold/5 transition-all" title="View Details">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(doubt.id)}
                            className={`p-2 rounded-lg bg-white/5 border border-white/5 transition-all ${doubt.status === 'Understood' ? 'text-emerald-500 hover:bg-emerald-500/5' : 'text-text-muted hover:text-emerald-500 hover:bg-emerald-500/5'}`} 
                            title="Mark as Understood"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(doubt.id)}
                            className="p-2 rounded-lg bg-white/5 border border-white/5 text-text-muted hover:text-red-500 hover:bg-red-500/5 transition-all" 
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg bg-white/5 border border-white/5 text-text-muted hover:text-gold lg:hidden">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-20 flex flex-col items-center justify-center text-center"
              >
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  <Inbox className="w-10 h-10 text-text-muted/30" />
                </div>
                <h3 className="font-display text-3xl text-text-primary mb-2">No doubts yet</h3>
                <p className="text-text-muted max-w-xs mb-8">
                  Your curiosity is the first step to mastery. Start asking and they will appear here.
                </p>
                <GoldButton variant="filled" className="px-8 py-3">
                  Ask Your First Doubt
                </GoldButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
