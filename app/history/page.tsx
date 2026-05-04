"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Filter,
  Inbox,
  Loader2,
  AlertCircle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "../../components/Footer";
import Card from "@/components/ui/Card";
import GoldButton from "@/components/ui/GoldButton";

interface Doubt {
  _id: string;
  question: string;
  subject?: string;
  explanation?: string;
  example?: string;
  quiz?: string[];
  status: "pending" | "understood";
  createdAt: string;
  updatedAt: string;
}

export default function HistoryPage() {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoubts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/doubts");
      const data = await res.json();
      if (res.ok) {
        setDoubts(data);
      } else {
        setError(data.error || "Failed to load your history.");
      }
    } catch (err) {
      console.error("Fetch history error:", err);
      setError("An error occurred while loading your history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoubts();
  }, [fetchDoubts]);

  const handleView = (doubt: Doubt) => {
    alert(`Question: ${doubt.question}\n\nExplanation: ${doubt.explanation || "No explanation yet."}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this doubt?")) return;
    try {
      const res = await fetch(`/api/doubts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDoubts((prev) => prev.filter((d) => d._id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "understood" ? "pending" : "understood";
    try {
      const res = await fetch(`/api/doubts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setDoubts((prev) =>
          prev.map((d) => (d._id === id ? { ...d, status: newStatus as "pending" | "understood" } : d))
        );
      }
    } catch (err) {
      console.error("Status toggle error:", err);
    }
  };

  const filteredDoubts = doubts.filter((d) =>
    d.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.subject && d.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-text-primary font-body">
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
              Your Doubts <span className="text-[#d4af37] italic">History</span>
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
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#d4af37]/50 transition-colors text-text-primary"
              />
            </div>
            <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-[#d4af37] transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Doubts List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-[#d4af37] animate-spin" />
                <p className="text-text-muted text-sm animate-pulse">Loading your history...</p>
              </div>
            ) : error ? (
              <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-full">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="font-display text-3xl text-text-primary">Oops!</h3>
                <p className="text-text-muted max-w-xs">{error}</p>
                <GoldButton onClick={fetchDoubts} variant="ghost" className="mt-4 border-white/10 text-text-primary">
                  Try Again
                </GoldButton>
              </div>
            ) : filteredDoubts.length > 0 ? (
              filteredDoubts.map((doubt) => (
                <motion.div
                  key={doubt._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl group hover:border-[#d4af37]/20 transition-all duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-lg bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 font-semibold">
                            {doubt.subject || "General"}
                          </span>
                          <span className="text-xs text-text-muted">
                            {new Date(doubt.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <h3 className="font-display text-2xl text-text-primary mb-2 group-hover:text-[#d4af37] transition-colors">
                          {doubt.question}
                        </h3>
                        {doubt.explanation && (
                          <p className="text-sm text-text-muted line-clamp-1 max-w-2xl italic">
                            &ldquo;{doubt.explanation}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
                        <div className="flex items-center gap-2 mr-4">
                          <span className={`flex h-2 w-2 rounded-full ${doubt.status === 'understood' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} />
                          <span className={`text-[10px] tracking-widest uppercase font-bold ${doubt.status === 'understood' ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {doubt.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleView(doubt)}
                            className="p-2 rounded-xl bg-white/5 border border-white/5 text-text-muted hover:text-[#d4af37] hover:bg-[#d4af37]/5 transition-all" 
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(doubt._id, doubt.status)}
                            className={`p-2 rounded-xl bg-white/5 border border-white/5 transition-all ${doubt.status === 'understood' ? 'text-emerald-500 hover:bg-emerald-500/5' : 'text-text-muted hover:text-emerald-500 hover:bg-emerald-500/5'}`} 
                            title={doubt.status === 'understood' ? "Mark as Pending" : "Mark as Understood"}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(doubt._id)}
                            className="p-2 rounded-xl bg-white/5 border border-white/5 text-text-muted hover:text-red-500 hover:bg-red-500/5 transition-all" 
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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
                <GoldButton variant="filled" className="px-8 py-3 bg-[#d4af37] text-[#0b0b0f] rounded-xl font-bold uppercase tracking-widest text-xs">
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
