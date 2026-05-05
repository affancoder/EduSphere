"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowLeft, ArrowRight, Clock, Loader2, BookOpen } from "lucide-react";
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
}

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await fetch(`/api/course/${params.id}`);
        const data = await res.json();
        if (res.ok) {
          setCourse(data.course);
          setLessons(data.lessons);
          const currentLesson = data.lessons.find((l: Lesson) => l._id === params.lessonId);
          if (currentLesson) {
            setLesson(currentLesson);
            setIsCompleted(currentLesson.isCompleted);
          } else {
            setError("Lesson not found");
          }
        } else {
          setError(data.error || "Failed to load lesson");
        }
      } catch (error) {
        console.error("Failed to fetch lesson:", error);
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [params.id, params.lessonId]);

  const handleMarkComplete = async () => {
    try {
      setIsSaving(true);
      const newCompletedStatus = !isCompleted;
      setIsCompleted(newCompletedStatus);

      const completedCount = lessons.filter((l) => 
        l._id === params.lessonId ? newCompletedStatus : l.isCompleted
      ).length;

      const res = await fetch("/api/progress/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: params.id,
          completedLessons: completedCount,
          totalLessons: lessons.length,
        }),
      });

      if (!res.ok) {
        setIsCompleted(!newCompletedStatus);
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
      setIsCompleted(!isCompleted);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrevious = () => {
    const currentIndex = lessons.findIndex((l) => l._id === params.lessonId);
    if (currentIndex > 0) {
      router.push(`/course/${params.id}/lesson/${lessons[currentIndex - 1]._id}`);
    }
  };

  const handleNext = () => {
    const currentIndex = lessons.findIndex((l) => l._id === params.lessonId);
    if (currentIndex < lessons.length - 1) {
      router.push(`/course/${params.id}/lesson/${lessons[currentIndex + 1]._id}`);
    } else {
      router.push(`/course/${params.id}`);
    }
  };

  const currentIndex = lessons.findIndex((l) => l._id === params.lessonId);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 container mx-auto px-6 pt-32 pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="h-10 bg-surface/50 rounded animate-pulse mb-4 w-32" />
              <div className="h-10 bg-surface/50 rounded animate-pulse mb-2" />
              <div className="h-6 bg-surface/50 rounded animate-pulse w-1/2" />
            </div>
            <div className="p-8 bg-surface/50 border border-border-gold/30 rounded-lg animate-pulse">
              <div className="h-64 bg-surface/30 rounded mb-6" />
              <div className="space-y-3">
                <div className="h-4 bg-surface/30 rounded" />
                <div className="h-4 bg-surface/30 rounded" />
                <div className="h-4 bg-surface/30 rounded w-3/4" />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <div className="flex-1 h-12 bg-surface/50 rounded animate-pulse" />
              <div className="flex-1 h-12 bg-surface/50 rounded animate-pulse" />
              <div className="flex-1 h-12 bg-surface/50 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 container mx-auto px-6 pt-32 pb-20 flex items-center justify-center">
          <Card className="p-12 text-center bg-surface border-red-500/30 border-dashed max-w-md">
            <BookOpen className="w-12 h-12 text-gold mx-auto mb-4" />
            <p className="text-red-400 mb-4">{error || "Lesson not found"}</p>
            <GoldButton
              variant="filled"
              onClick={() => router.push(`/course/${params.id}`)}
            >
              Back to Course
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
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <GoldButton
              variant="ghost"
              onClick={() => router.push(`/course/${params.id}`)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </GoldButton>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gold text-xs uppercase tracking-widest font-bold mb-2">
                  Lesson {lesson.order} of {lessons.length}
                </p>
                <h1 className="font-display text-3xl md:text-4xl text-text-primary mb-2">
                  {lesson.title}
                </h1>
                {lesson.description && (
                  <p className="text-text-muted">{lesson.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Clock className="w-4 h-4" />
                {lesson.duration} mins
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-8 bg-surface border-border-gold mb-8">
              {lesson.videoUrl && (
                <div className="mb-6">
                  <video
                    src={lesson.videoUrl}
                    controls
                    className="w-full rounded-lg"
                  />
                </div>
              )}
              <div className="prose prose-invert max-w-none">
                <div
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                  className="text-text-primary"
                />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between gap-4"
          >
            <GoldButton
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </GoldButton>

            <GoldButton
              variant={isCompleted ? "ghost" : "filled"}
              onClick={handleMarkComplete}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className={`w-4 h-4 mr-2 ${isCompleted ? "text-emerald-500" : ""}`} />
              )}
              {isSaving ? "Saving..." : isCompleted ? "Completed" : "Mark Complete"}
            </GoldButton>

            <GoldButton
              variant="ghost"
              onClick={handleNext}
              className="flex-1"
            >
              {currentIndex === lessons.length - 1 ? "Finish Course" : "Next"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </GoldButton>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
