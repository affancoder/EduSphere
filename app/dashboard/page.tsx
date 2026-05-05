"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Settings, 
  LogOut, 
  Loader2, 
  Flame, 
  Clock, 
  TrendingUp, 
  CheckCircle2,
  Circle,
  BookOpen,
  ArrowRight,
  Send,
  History,
  BrainCircuit,
  Sparkles,
  Target
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/ui/Card";
import GoldButton from "@/components/ui/GoldButton";
import Link from "next/link";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  streak: number;
  lastLogin: string;
  profileImage?: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  thumbnail: string;
  totalLessons: number;
  duration: number;
  enrolledCount: number;
}

interface Progress {
  _id: string;
  courseId: string;
  completedLessons: string[];
  lastAccessed: string;
  percentage: number;
  totalLessons: number;
}

interface HistoryItem {
  _id: string;
  courseId: string;
  courseName: string;
  lessonName: string;
  action: string;
  timestamp: string;
  completionStatus: string;
  timeSpent: number;
  createdAt: string;
}

interface Doubt {
  _id: string;
  question: string;
  answer: string;
  topic?: string;
  subject: string;
  createdAt: string;
}

interface Roadmap {
  _id: string;
  goal: string;
  topics: { title: string; isCompleted: boolean }[];
  status: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  // Doubt State
  const [newQuestion, setNewQuestion] = useState("");
  const [askingDoubt, setAskingDoubt] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, coursesRes, historyRes, progressRes, doubtsRes, roadmapsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/courses"),
          fetch("/api/history"),
          fetch("/api/progress"),
          fetch("/api/ai/history"),
          fetch("/api/roadmap/list")
        ]);

        const userData = await userRes.json();
        const coursesData = await coursesRes.json();
        const historyData = await historyRes.json();
        const progressData = await progressRes.json();
        const doubtsData = await doubtsRes.json();
        const roadmapsData = await roadmapsRes.json();

        if (userRes.ok) setUser(userData.user);
        if (coursesData.success) setCourses(coursesData.courses || []);
        if (historyRes.ok) setHistory(historyData.history || []);
        if (progressRes.ok) setProgress(progressData.progress || []);
        if (doubtsData.success) setDoubts(doubtsData.history || []);
        if (roadmapsData.success) setRoadmaps(roadmapsData.roadmaps || []);

        if (!userRes.ok) router.push("/login");
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const masteredTopics = useMemo(() => {
    const roadmapTopics = roadmaps.flatMap(r => r.topics.filter(t => t.isCompleted).map(t => t.title));
    const doubtTopics = doubts.filter(d => d.topic).map(d => d.topic!);
    return Array.from(new Set([...roadmapTopics, ...doubtTopics]));
  }, [roadmaps, doubts]);

  const handleAskDoubt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    try {
      setAskingDoubt(true);
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQuestion }),
      });
      const data = await res.json();
      if (res.ok) {
        setDoubts([data.doubt, ...doubts]);
        setNewQuestion("");
      }
    } catch (err) {
      console.error("Failed to ask doubt:", err);
    } finally {
      setAskingDoubt(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        localStorage.removeItem("isLoggedIn");
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchesFilter = statusFilter === "all" || item.completionStatus === statusFilter;
      return matchesFilter;
    });
  }, [history, statusFilter]);

  const totalProgress = useMemo(() => {
    return progress.length > 0 
      ? Math.round(progress.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / progress.length)
      : 0;
  }, [progress]);

  const totalLearningTime = useMemo(() => {
    return history.reduce((acc, curr) => acc + (Number(curr.timeSpent) || 0), 0);
  }, [history]);

  const learningScore = useMemo(() => {
    // Formula for Intelligence Score (0-100)
    // 1. Questions Factor (up to 30 points) - 3 points per doubt
    const questionsPoints = Math.min(30, doubts.length * 3);
    
    // 2. Topics Factor (up to 40 points) - 5 points per unique mastered topic
    const topicsPoints = Math.min(40, masteredTopics.length * 5);
    
    // 3. Activity Factor (up to 30 points) - 2 points per lesson/history item
    const activityPoints = Math.min(30, history.length * 2);
    
    return questionsPoints + topicsPoints + activityPoints;
  }, [doubts, masteredTopics, history]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
          >
            <div>
              <h1 className="font-display text-4xl md:text-5xl text-text-primary mb-2">
                Welcome back, <span className="text-gold italic">{user?.name}</span>
              </h1>
              <p className="text-text-muted">{user?.email}</p>
              <p className="text-text-muted text-sm">Last login: {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "First time logging in"}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/settings">
                <GoldButton variant="ghost">
                  <Settings className="w-4 h-4" />
                  Settings
                </GoldButton>
              </Link>
              <GoldButton variant="filled" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Logout
              </GoldButton>
            </div>
          </motion.div>

          {/* Intelligence Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
            <Card className="p-6 bg-surface border-border-gold flex items-center gap-4 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-gold shadow-[0_0_10px_rgba(201,168,76,0.5)]" />
              <div className="flex-1">
                <p className="text-gold text-[10px] uppercase tracking-widest font-bold mb-1">Intelligence Score</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-display text-text-primary">{learningScore}</span>
                  <span className="text-text-muted text-xs">/100</span>
                </div>
              </div>
              <div className="p-2 bg-gold/10 rounded-lg text-gold">
                <BrainCircuit className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
            </Card>
            <Card className="p-6 bg-surface border-border-gold flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <p className="text-text-muted text-[10px] uppercase tracking-widest font-bold">Streak</p>
                <p className="text-2xl font-display">{user?.streak || 0} Days</p>
              </div>
            </Card>
            <Card className="p-6 bg-surface border-border-gold flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-text-muted text-[10px] uppercase tracking-widest font-bold">Time</p>
                <p className="text-2xl font-display">{totalLearningTime}m</p>
              </div>
            </Card>
            <Card className="p-6 bg-surface border-border-gold flex items-center gap-4">
              <div className="p-3 bg-gold/10 rounded-xl text-gold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-text-muted text-[10px] uppercase tracking-widest font-bold">Progress</p>
                <p className="text-2xl font-display">{totalProgress}%</p>
              </div>
            </Card>
            <Card className="p-6 bg-surface border-border-gold flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-text-muted text-[10px] uppercase tracking-widest font-bold">Nodes</p>
                <p className="text-2xl font-display">{masteredTopics.length}</p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
            {/* AI Brain - Mastered Topics */}
            <div className="lg:col-span-1">
              <h2 className="font-display text-3xl text-text-primary mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-gold" />
                AI <span className="text-gold italic">Brain</span>
              </h2>
              <Card className="p-8 bg-surface border-border-gold h-full">
                <p className="text-xs font-bold text-gold uppercase tracking-widest mb-6">Knowledge Nodes</p>
                <div className="flex flex-wrap gap-3">
                  {masteredTopics.length > 0 ? (
                    masteredTopics.map((topic, idx) => (
                      <motion.span
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="px-3 py-1.5 rounded-full bg-gold/5 border border-gold/20 text-[10px] text-text-primary uppercase tracking-wider font-medium hover:bg-gold/10 transition-colors"
                      >
                        {topic}
                      </motion.span>
                    ))
                  ) : (
                    <p className="text-text-muted text-sm italic">No topics mastered yet. Complete AI roadmap steps to expand your brain.</p>
                  )}
                </div>
                
                {roadmaps.length > 0 && (
                  <div className="mt-12 pt-12 border-t border-border-gold/20">
                    <p className="text-xs font-bold text-gold uppercase tracking-widest mb-6">Active Paths</p>
                    <div className="space-y-4">
                      {roadmaps.slice(0, 3).map((r) => (
                        <div key={r._id} className="cursor-pointer group" onClick={() => router.push(`/learning-hub/roadmap/${r._id}`)}>
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-xs font-medium text-text-primary group-hover:text-gold transition-colors truncate pr-4">{r.goal}</p>
                            <ArrowRight className="w-3 h-3 text-gold opacity-0 group-hover:opacity-100 transition-all" />
                          </div>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gold" 
                              style={{ width: `${(r.topics.filter(t => t.isCompleted).length / r.topics.length) * 100}%` }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* AI Interaction - Feed */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-3xl text-text-primary flex items-center gap-2">
                  <History className="w-6 h-6 text-gold" />
                  Brain <span className="text-gold italic">Feed</span>
                </h2>
                <GoldButton variant="ghost" className="text-xs" onClick={() => router.push('/learning-hub')}>
                  Research New Topic
                </GoldButton>
              </div>
              <div className="space-y-6">
                <Card className="p-6 bg-surface border-border-gold">
                  <form onSubmit={handleAskDoubt} className="flex gap-4">
                    <input
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Ask your brain anything..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-gold/50 transition-colors"
                      required
                    />
                    <GoldButton variant="filled" disabled={askingDoubt} className="px-6">
                      {askingDoubt ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </GoldButton>
                  </form>
                </Card>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gold/20">
                  {doubts.length > 0 ? (
                    doubts.map((doubt) => (
                      <motion.div
                        key={doubt._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <Card className="p-6 bg-surface border-border-gold/30 hover:border-gold/50 transition-all group">
                          <div className="flex justify-between items-start mb-3">
                            <span className="px-2 py-0.5 rounded bg-gold/10 border border-gold/20 text-[8px] uppercase tracking-widest font-bold text-gold">
                              {doubt.topic || "Insight"}
                            </span>
                            <span className="text-[8px] text-text-muted uppercase font-bold">
                              {new Date(doubt.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="text-sm font-medium text-text-primary mb-2 group-hover:text-gold transition-colors">Q: {doubt.question}</h4>
                          <p className="text-xs text-text-muted line-clamp-2 italic">A: {doubt.answer}</p>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <Card className="p-12 text-center bg-surface border-border-gold border-dashed">
                      <p className="text-text-muted italic text-sm">Your brain feed is quiet. Start asking questions to populate it.</p>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Standard Resources */}
          <div className="mb-12">
            <h2 className="font-display text-3xl text-text-primary mb-6">Standard <span className="text-gold italic">Resources</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-6 bg-surface border-border-gold hover:border-gold/30 transition-all h-full flex flex-col">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-gold">
                          {course.category}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">
                          {course.level}
                        </span>
                      </div>
                      <h3 className="font-display text-xl text-text-primary mb-2">
                        {course.title}
                      </h3>
                      <p className="text-text-muted text-sm mb-4 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-text-muted mb-4">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {course.totalLessons} Lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {course.duration} mins
                        </span>
                      </div>
                    </div>
                    <GoldButton
                      variant="ghost"
                      onClick={() => router.push(`/course/${course._id}`)}
                      className="w-full text-xs"
                    >
                      Enter Resource
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </GoldButton>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Legacy History (Optional: Can keep or remove) */}
          <div className="border-t border-border-gold/10 pt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl text-text-primary">Resource Activity</h2>
              <div className="flex items-center gap-3">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-surface border border-border-gold rounded-lg px-3 py-2 text-[10px] text-text-primary focus:outline-none uppercase tracking-widest font-bold"
                >
                  <option value="all">All</option>
                  <option value="completed">Completed</option>
                  <option value="in-progress">Active</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHistory.slice(0, 4).map((item) => (
                <Card key={item._id} className="p-4 bg-surface border-border-gold/20 hover:border-gold/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gold text-[8px] uppercase tracking-widest font-bold mb-1">{item.courseName}</p>
                      <h4 className="text-text-primary font-display text-lg mb-1">{item.lessonName}</h4>
                      <div className="flex items-center gap-4 text-[10px] text-text-muted uppercase tracking-tight">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.timeSpent}m</span>
                        <span className="flex items-center gap-1">
                          {item.completionStatus === 'completed' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Circle className="w-3 h-3 text-amber-500" />}
                          {item.completionStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
