"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Target, 
  Calendar, 
  ArrowRight, 
  Plus,
  Loader2,
  CheckCircle2,
  Circle,
  BrainCircuit,
  Search,
  Bookmark,
  Check
} from "lucide-react";
import GoldButton from "@/components/ui/GoldButton";
import Card from "@/components/ui/Card";
import ReactMarkdown from "react-markdown";

interface Topic {
  title: string;
  description: string;
  isCompleted: boolean;
  order: number;
}

interface Roadmap {
  _id: string;
  goal: string;
  description: string;
  topics: Topic[];
  difficulty: string;
  estimatedWeeks: number;
  status: string;
}

interface SearchResult {
  explanation: string;
  topic: string;
}

export default function LearningHubPage() {
  const [goal, setGoal] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [loading, setLoading] = useState(false);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [fetching, setFetching] = useState(true);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const fetchRoadmaps = async () => {
    try {
      const res = await fetch("/api/roadmap/list");
      const data = await res.json();
      if (res.ok) {
        setRoadmaps(data.roadmaps);
      }
    } catch (error) {
      console.error("Failed to fetch roadmaps:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchRoadmaps(), 0);
    return () => clearTimeout(timer);
  }, []);

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, difficulty }),
      });
      const data = await res.json();
      if (res.ok) {
        setRoadmaps([data.roadmap, ...roadmaps]);
        setGoal("");
      } else {
        alert(data.error || "Failed to generate roadmap");
      }
    } catch (error) {
      console.error("Failed to generate roadmap:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchResult(null);
    setIsSaved(false);
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      if (res.ok) {
        setSearchResult({ explanation: data.explanation, topic: data.topic });
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleSaveToLearning = async () => {
    if (!searchResult) return;

    setSaving(true);
    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question: `Learn about: ${searchResult.topic}`,
          answer: searchResult.explanation, // Reusing ask API to save custom content
          topic: searchResult.topic
        }),
      });
      if (res.ok) {
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Sparkles className="w-4 h-4" />
            AI-Powered Personalized Learning
          </motion.div>
          <h1 className="font-display text-5xl md:text-7xl text-text-primary mb-6">
            Learning <span className="text-gold italic">Hub</span>
          </h1>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Design personalized roadmaps or research specific topics with our elite AI intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Research Section */}
          <div className="space-y-8">
            <h2 className="font-display text-3xl text-text-primary flex items-center gap-3">
              <Search className="w-6 h-6 text-gold" />
              Topic Research
            </h2>
            <Card className="p-8 bg-surface border-border-gold h-full">
              <form onSubmit={handleSearch} className="flex gap-4 mb-8">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Research any topic..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-gold/50 transition-colors"
                />
                <GoldButton variant="filled" disabled={searching}>
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Explore"}
                </GoldButton>
              </form>

              <AnimatePresence mode="wait">
                {searchResult ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-center border-b border-border-gold/20 pb-4">
                      <h3 className="font-display text-2xl text-gold">{searchResult.topic}</h3>
                      <GoldButton 
                        variant="ghost" 
                        className="text-xs" 
                        onClick={handleSaveToLearning}
                        disabled={saving || isSaved}
                      >
                        {saving ? (
                          <Loader2 className="w-3 h-3 animate-spin mr-2" />
                        ) : isSaved ? (
                          <Check className="w-3 h-3 mr-2" />
                        ) : (
                          <Bookmark className="w-3 h-3 mr-2" />
                        )}
                        {isSaved ? "Saved to Memory" : "Save to Learning"}
                      </GoldButton>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none max-h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gold/20">
                      <ReactMarkdown>{searchResult.explanation}</ReactMarkdown>
                    </div>
                  </motion.div>
                ) : !searching && (
                  <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                    <Search className="w-12 h-12 mb-4" />
                    <p className="text-sm italic">Search for a topic to see its AI explanation.</p>
                  </div>
                )}
              </AnimatePresence>
            </Card>
          </div>

          {/* Generate Roadmap Section */}
          <div className="space-y-8">
            <h2 className="font-display text-3xl text-text-primary flex items-center gap-3">
              <BrainCircuit className="w-6 h-6 text-gold" />
              Path Generation
            </h2>
            <Card className="p-8 bg-surface border-border-gold h-full">
              <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                  <label className="block text-gold text-xs font-bold uppercase tracking-widest mb-3">
                    Goal
                  </label>
                  <textarea
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. Master Next.js 14 and build a SaaS..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-text-primary focus:outline-none focus:border-gold/50 transition-colors min-h-[100px]"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gold text-xs font-bold uppercase tracking-widest mb-3">
                      Difficulty
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-gold/50 transition-colors"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <GoldButton
                      variant="filled"
                      className="w-full h-[50px]"
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                      {loading ? "Designing..." : "Create Path"}
                    </GoldButton>
                  </div>
                </div>
              </form>
            </Card>
          </div>
        </div>

        {/* Active Roadmaps */}
        <div className="space-y-8">
          <h2 className="font-display text-3xl text-text-primary flex items-center gap-3">
            <Target className="w-6 h-6 text-gold" />
            Active Learning Paths
          </h2>

          {fetching ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-gold" />
            </div>
          ) : roadmaps.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {roadmaps.map((roadmap) => (
                <motion.div
                  key={roadmap._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-8 bg-surface border-border-gold hover:border-gold/30 transition-all h-full flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-gold px-2 py-1 rounded bg-gold/10 border border-gold/20 mb-2 inline-block">
                          {roadmap.difficulty}
                        </span>
                        <h3 className="font-display text-2xl text-text-primary mt-2">
                          {roadmap.goal}
                        </h3>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-text-muted text-xs uppercase tracking-widest font-bold">
                          <Calendar className="w-3 h-3" />
                          {roadmap.estimatedWeeks} Weeks
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-text-muted text-sm mb-8 italic">
                      {roadmap.description}
                    </p>

                    <div className="space-y-4 mb-8 flex-1">
                      {roadmap.topics.slice(0, 4).map((topic, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          {topic.isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-gold/30 shrink-0" />
                          )}
                          <div>
                            <p className={`text-sm font-medium ${topic.isCompleted ? "text-text-muted line-through" : "text-text-primary"}`}>
                              {topic.title}
                            </p>
                          </div>
                        </div>
                      ))}
                      {roadmap.topics.length > 4 && (
                        <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold pl-8">
                          + {roadmap.topics.length - 4} more topics
                        </p>
                      )}
                    </div>

                    <GoldButton
                      variant="ghost"
                      className="w-full mt-auto"
                      onClick={() => window.location.href = `/learning-hub/roadmap/${roadmap._id}`}
                    >
                      Enter Learning Experience
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </GoldButton>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-16 text-center bg-surface border-border-gold border-dashed">
              <BrainCircuit className="w-16 h-16 text-gold mx-auto mb-6 opacity-50" />
              <p className="text-text-muted italic text-lg mb-2">No active learning paths found.</p>
              <p className="text-text-muted text-sm">Create your first elite curriculum above to start your journey.</p>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
