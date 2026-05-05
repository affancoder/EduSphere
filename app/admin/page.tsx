"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Loader2,
  CheckCircle2,
  Trash2,
  MessageSquare,
  Clock,
  RefreshCcw,
  AlertCircle
} from "lucide-react";
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

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, understood: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "understood">("all");
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  const fetchDoubts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/doubts");
      const data = await res.json();
      if (res.ok) {
        setDoubts(data);
      } else {
        setError(data.error || "Failed to fetch doubts");
      }
    } catch (err) {
      console.error("Failed to fetch doubts:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = typeof window !== "undefined" && localStorage.getItem("admin_logged_in") === "true";
      
      if (!loggedIn) {
        setIsAuthenticated(false);
        router.push("/admin/login");
      } else {
        setIsAuthenticated(true);
        // Using Promise.all for parallel fetching
        Promise.all([fetchDoubts(), fetchStats()]).catch(err => {
          console.error("Dashboard initial load failed:", err);
        });
      }
    };
    
    checkAuth();
  }, [router, fetchDoubts, fetchStats]);

  const handleUpdateStatus = async (id: string, newStatus: "pending" | "understood") => {
    setProcessingIds(prev => new Set(prev).add(id));
    setError(null);
    try {
      const res = await fetch(`/api/doubts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setDoubts(prev => prev.map(d => d._id === id ? { ...d, status: newStatus } : d));
        // Refresh stats after status update
        fetchStats();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update status");
      }
    } catch (err) {
      console.error("Update failed:", err);
      setError("Failed to connect to server. Check your connection.");
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this doubt?")) return;
    setProcessingIds(prev => new Set(prev).add(id));
    setError(null);
    try {
      const res = await fetch(`/api/doubts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDoubts(prev => prev.filter(d => d._id !== id));
        // Refresh stats after deletion
        fetchStats();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete doubt");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Failed to connect to server. Check your connection.");
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("admin_logged_in");
    router.push("/admin/login");
  }, [router]);

  const filteredDoubts = useMemo(() => {
    return doubts.filter((d: Doubt) => {
      if (filter === "all") return true;
      return d.status === filter;
    });
  }, [doubts, filter]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0b0b0f] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-[#d4af37] animate-spin" />
        <div className="flex flex-col items-center gap-1">
          <p className="text-text-muted text-sm font-bold tracking-widest uppercase animate-pulse">Verifying credentials...</p>
          <p className="text-[10px] text-text-muted opacity-50 uppercase tracking-tighter">Securing your session</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null;
  }

  const isInitialLoading = loading && doubts.length === 0;

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-text-primary font-body p-6 md:p-12">
      <main className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-display text-4xl md:text-5xl"
            >
              Admin <span className="text-[#d4af37] italic">Dashboard</span>
            </motion.h1>
            <p className="text-text-muted mt-2">Manage student inquiries and platform activity.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => fetchDoubts()}
              disabled={loading}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-[#d4af37] transition-all disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <GoldButton variant="ghost" onClick={handleLogout} className="border-[#d4af37]/30 text-[#d4af37]">
              <LogOut className="w-4 h-4" />
              Logout
            </GoldButton>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500"
          >
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Action Required</p>
              <p className="text-xs opacity-80">{error}</p>
            </div>
            <button 
              onClick={fetchDoubts}
              className="ml-auto text-xs font-bold underline hover:no-underline"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Total Doubts", value: stats.total, icon: <MessageSquare className="w-5 h-5" />, color: "text-[#d4af37]" },
            { label: "Pending", value: stats.pending, icon: <Clock className="w-5 h-5" />, color: "text-amber-500" },
            { label: "Understood", value: stats.understood, icon: <CheckCircle2 className="w-5 h-5" />, color: "text-emerald-500" },
          ].map((stat, i) => (
            <Card key={i} className="p-6 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl relative overflow-hidden">
              {isInitialLoading && (
                <div className="absolute inset-0 bg-white/5 animate-pulse z-10" />
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="text-text-muted text-xs tracking-widest uppercase font-semibold">{stat.label}</span>
                <div className={`${stat.color} opacity-80`}>{stat.icon}</div>
              </div>
              <div className="text-3xl font-display">{isInitialLoading ? "..." : stat.value}</div>
            </Card>
          ))}
        </div>

        {/* Filters & Content */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
            {(["all", "pending", "understood"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs tracking-widest uppercase font-bold transition-all ${
                  filter === f 
                    ? "bg-[#d4af37] text-[#0b0b0f]" 
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="text-xs text-text-muted hidden sm:block">
            Showing {filteredDoubts.length} results
          </div>
        </div>

        {/* Table Layout */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-xs tracking-widest uppercase font-bold text-[#d4af37]">Question</th>
                  <th className="px-6 py-4 text-xs tracking-widest uppercase font-bold text-[#d4af37]">Subject</th>
                  <th className="px-6 py-4 text-xs tracking-widest uppercase font-bold text-[#d4af37]">Status</th>
                  <th className="px-6 py-4 text-xs tracking-widest uppercase font-bold text-[#d4af37]">Date</th>
                  <th className="px-6 py-4 text-xs tracking-widest uppercase font-bold text-[#d4af37] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {isInitialLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={`skeleton-${i}`} className="animate-pulse">
                        <td className="px-6 py-6"><div className="h-4 bg-white/10 rounded w-3/4"></div></td>
                        <td className="px-6 py-6"><div className="h-4 bg-white/10 rounded w-20"></div></td>
                        <td className="px-6 py-6"><div className="h-4 bg-white/10 rounded w-24"></div></td>
                        <td className="px-6 py-6"><div className="h-4 bg-white/10 rounded w-16"></div></td>
                        <td className="px-6 py-6"><div className="h-4 bg-white/10 rounded w-20 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : filteredDoubts.length > 0 ? (
                    filteredDoubts.map((doubt) => (
                      <motion.tr 
                        key={doubt._id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm text-text-primary font-medium line-clamp-1 group-hover:text-[#d4af37] transition-colors">
                            {doubt.question}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] text-text-muted bg-white/5 px-2 py-1 rounded-md border border-white/10 uppercase tracking-tighter font-bold">
                            {doubt.subject || "General"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              doubt.status === "understood" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                            }`} />
                            <span className={`text-[10px] tracking-widest uppercase font-bold ${
                              doubt.status === "understood" ? "text-emerald-500" : "text-amber-500"
                            }`}>
                              {doubt.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-text-muted tabular-nums">
                          {new Date(doubt.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {doubt.status === "pending" && (
                              <button 
                                onClick={() => handleUpdateStatus(doubt._id, "understood")}
                                disabled={processingIds.has(doubt._id)}
                                className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Mark as Understood"
                              >
                                {processingIds.has(doubt._id) ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            <button 
                              onClick={() => handleDelete(doubt._id)}
                              disabled={processingIds.has(doubt._id)}
                              className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete Doubt"
                            >
                              {processingIds.has(doubt._id) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key="empty"
                    >
                      <td colSpan={5} className="px-6 py-12 text-center text-text-muted italic text-sm">
                        No doubts found matching the criteria.
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}