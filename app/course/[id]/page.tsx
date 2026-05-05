"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Clock, CheckCircle2, Circle, ArrowLeft, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/ui/Card";
import GoldButton from "@/components/ui/GoldButton";

interface Lesson {
  _id: string;
  title: string;
  description: string;
  content: string;
  videoUrl: string;
  order: number;
  duration: number;
  isCompleted: boolean;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  totalLessons: number;
  duration: number;
}

export default function CoursePage() {
  const router = useRouter();
  const params = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const [courseRes, progressRes] = await Promise.all([
          fetch(`/api/courses/${params.id}`),
          fetch(`/api/progress/course/${params.id}`)
        ]);

        const courseData = await courseRes.json();
        const progressData = await progressRes.json();

        if (courseRes.ok) {
          setCourse(courseData.course);
          setLessons(courseData.lessons);
        } else {
          setError(courseData.error || "Failed to load course");
        }

        if (progressRes.ok && progressData.progress) {
          setCompletedLessons(new Set(progressData.progress.completedLessons));
        }
      } catch (error) {
        console.error("Failed to fetch course data:", error);
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [params.id]);

  const handleLessonClick = (lessonId: string) => {
    router.push(`/course/${params.id}/lesson/${lessonId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 container mx-auto px-6 pt-32 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="h-10 bg-surface/50 rounded animate-pulse mb-4 w-48" />
              <div className="h-12 bg-surface/50 rounded animate-pulse mb-2" />
              <div className="h-6 bg-surface/50 rounded animate-pulse w-2/3" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-6 bg-surface/50 border border-border-gold/30 rounded-lg animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-surface/30" />
                    <div className="flex-1">
                      <div className="h-5 bg-surface/30 rounded mb-2" />
                      <div className="h-4 bg-surface/30 rounded w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 container mx-auto px-6 pt-32 pb-20 flex items-center justify-center">
          <Card className="p-12 text-center bg-surface border-red-500/30 border-dashed max-w-md">
            <BookOpen className="w-12 h-12 text-gold mx-auto mb-4" />
            <p className="text-red-400 mb-4">{error || "Course not found"}</p>
            <GoldButton
              variant="filled"
              onClick={() => router.push("/courses")}
            >
              Back to Courses
            </GoldButton>
          </Card>
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
            className="mb-8"
          >
            <GoldButton
              variant="ghost"
              onClick={() => router.push("/courses")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </GoldButton>
            <h1 className="font-display text-4xl md:text-5xl text-text-primary mb-2">
              {course.title}
            </h1>
            <p className="text-text-muted text-lg mb-4">{course.description}</p>
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {lessons.length} Lessons
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {course.duration} mins
              </span>
            </div>
          </motion.div>

          <div className="space-y-4">
            {lessons.map((lesson, index) => (
              <motion.div
                key={lesson._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div
                  className="p-6 bg-surface border border-border-gold rounded-lg hover:border-gold/30 transition-all cursor-pointer"
                  onClick={() => handleLessonClick(lesson._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-sm">
                        {lesson.order}
                      </div>
                      <div>
                        <h3 className="font-display text-lg text-text-primary mb-1">
                          {lesson.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-text-muted">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {lesson.duration} mins
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {completedLessons.has(lesson._id) ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
