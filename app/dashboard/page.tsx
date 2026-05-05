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
  Search, 
  CheckCircle2,
  Circle,
  BookOpen,
  ArrowRight
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

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, coursesRes, historyRes, progressRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/courses"),
          fetch("/api/history"),
          fetch("/api/progress")
        ]);

        const [userData, coursesData, historyData, progressData] = await Promise.all([
          userRes.json(),
          coursesRes.json(),
          historyRes.json(),
          progressRes.json()
        ]);

        if (userRes.ok) setUser(userData.user);
        if (coursesRes.ok) setCourses(coursesData.courses || []);
        if (historyRes.ok) setHistory(historyData.history || []);
        if (progressRes.ok) setProgress(progressData.progress || []);

        if (!userRes.ok) router.push("/login");
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

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
      const matchesSearch = (item.courseName || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = statusFilter === "all" || item.completionStatus === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [history, searchTerm, statusFilter]);

  const totalProgress = useMemo(() => {
    return progress.length > 0 
      ? Math.round(progress.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / progress.length)
      : 0;
  }, [progress]);

  const totalLearningTime = useMemo(() => {
    return history.reduce((acc, curr) => acc + (Number(curr.timeSpent) || 0), 0);
  }, [history]);

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

          {/* Available Courses */}
          <div className="mb-12">
            <h2 className="font-display text-3xl text-text-primary mb-6">Available Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
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
                      variant="filled"
                      onClick={() => router.push(`/course/${course._id}`)}
                      className="w-full"
                    >
                      Continue Learning
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </GoldButton>
                  </Card>
                </motion.div>
              ))}
            </div>
            {courses.length === 0 && (
              <Card className="p-12 text-center bg-surface border-border-gold border-dashed">
                <BookOpen className="w-12 h-12 text-gold mx-auto mb-4" />
                <p className="text-text-muted italic mb-2">No courses available yet.</p>
                <p className="text-text-muted text-sm">Check back later for new content!</p>
              </Card>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 bg-surface border-border-gold flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <p className="text-text-muted text-xs uppercase tracking-widest font-bold">Learning Streak</p>
                <p className="text-2xl font-display">{user?.streak || 0} Days</p>
              </div>
            </Card>
            <Card className="p-6 bg-surface border-border-gold flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-text-muted text-xs uppercase tracking-widest font-bold">Total Time</p>
                <p className="text-2xl font-display">{totalLearningTime} Mins</p>
              </div>
            </Card>
            <Card className="p-6 bg-surface border-border-gold flex items-center gap-4">
              <div className="p-3 bg-gold/10 rounded-xl text-gold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-text-muted text-xs uppercase tracking-widest font-bold">Overall Progress</p>
                <p className="text-2xl font-display">{totalProgress}%</p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Learning History */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-3xl text-text-primary">Learning History</h2>
                <div className="flex items-center gap-3">
                  <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input 
                      type="text"
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-surface border border-border-gold rounded-lg pl-9 pr-4 py-2 text-xs text-text-primary focus:outline-none focus:border-gold/50"
                    />
                  </div>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-surface border border-border-gold rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="in-progress">In Progress</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item) => (
                    <Card key={item._id} className="p-6 bg-surface border-border-gold hover:border-gold/30 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gold text-[10px] uppercase tracking-widest font-bold mb-1">{item.courseName}</p>
                          <h4 className="text-text-primary font-display text-xl mb-1">{item.lessonName}</h4>
                          <div className="flex items-center gap-4 text-xs text-text-muted">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.timeSpent} mins</span>
                            <span className="flex items-center gap-1">
                              {item.completionStatus === 'completed' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Circle className="w-3 h-3 text-amber-500" />}
                              {item.completionStatus}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-text-muted font-bold">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-12 text-center bg-surface border-border-gold border-dashed">
                    <p className="text-text-muted italic">No history found matching your criteria.</p>
                  </Card>
                )}
              </div>
            </div>

            {/* Progress Track */}
            <div>
              <h2 className="font-display text-3xl text-text-primary mb-6">Course Progress</h2>
              <div className="space-y-6">
                {progress.map((course) => (
                  <Card key={course._id} className="p-6 bg-surface border-border-gold">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-display text-xl text-text-primary">{course.courseId}</h4>
                      <span className="text-gold font-bold text-sm">{course.percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${course.percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gold shadow-[0_0_10px_rgba(201,168,76,0.3)]"
                      />
                    </div>
                    <p className="text-[10px] text-text-muted mt-3 uppercase tracking-widest font-bold">
                      {course.completedLessons} / {course.totalLessons} Lessons Completed
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
