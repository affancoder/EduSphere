"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Clock, Users, ArrowRight, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/ui/Card";
import GoldButton from "@/components/ui/GoldButton";

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

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses");
        const data = await res.json();
        if (data.success) {
          setCourses(data.courses);
        } else {
          setError(data.error || "Failed to load courses");
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 container mx-auto px-6 pt-32 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <div className="h-12 bg-surface/50 rounded animate-pulse mb-4" />
              <div className="h-6 bg-surface/50 rounded animate-pulse w-2/3" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="p-6 bg-surface/50 border border-border-gold/30 rounded-lg animate-pulse">
                  <div className="h-4 bg-surface/30 rounded w-1/3 mb-3" />
                  <div className="h-6 bg-surface/30 rounded mb-2" />
                  <div className="h-4 bg-surface/30 rounded mb-4" />
                  <div className="h-10 bg-surface/30 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="font-display text-4xl md:text-5xl text-text-primary mb-4">
              Explore Courses
            </h1>
            <p className="text-text-muted text-lg">
              Master new skills with our comprehensive learning paths
            </p>
          </motion.div>

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
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {course.enrolledCount}
                      </span>
                    </div>
                  </div>
                  <GoldButton
                    variant="filled"
                    onClick={() => router.push(`/course/${course._id}`)}
                    className="w-full"
                  >
                    Start Learning
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </GoldButton>
                </Card>
              </motion.div>
            ))}
          </div>

          {error && (
            <Card className="p-12 text-center bg-surface border-red-500/30 border-dashed">
              <p className="text-red-400 mb-4">{error}</p>
              <GoldButton
                variant="filled"
                onClick={() => window.location.reload()}
              >
                Try Again
              </GoldButton>
            </Card>
          )}

          {!error && courses.length === 0 && (
            <Card className="p-12 text-center bg-surface border-border-gold border-dashed">
              <BookOpen className="w-12 h-12 text-gold mx-auto mb-4" />
              <p className="text-text-muted italic mb-2">No courses available yet.</p>
              <p className="text-text-muted text-sm">Check back later for new content!</p>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
