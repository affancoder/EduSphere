"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Clock, CheckCircle2, Circle, ArrowLeft } from "lucide-react";
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
  modules?: Array<{
    _id?: string;
    title: string;
    videos?: Array<{ _id?: string; title: string; url: string }>;
    resources?: Array<{ _id?: string; title: string; url: string; type: "pdf" }>;
  }>;
}

interface UserProfile {
  _id: string;
  purchasedCourses?: string[];
}

export default function CoursePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = String(params.id);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [access, setAccess] = useState<{
    allowed: boolean;
    category: "free" | "premium";
    price: number;
  } | null>(null);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [unlockError, setUnlockError] = useState<string>("");

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const [courseRes, progressRes, accessRes, userRes] = await Promise.all([
          fetch(`/api/courses/${courseId}`),
          fetch(`/api/progress/course/${courseId}`),
          fetch(`/api/course/access/${courseId}`),
          fetch("/api/auth/me"),
        ]);

        const courseData = await courseRes.json();
        const progressData = await progressRes.json();
        const accessData = await accessRes.json();
        const userData = await userRes.json();

        if (courseData.success) {
          setCourse(courseData.course);
          setLessons(courseData.lessons);
        } else {
          setError(courseData.error || "Failed to load course");
        }

        if (accessData) {
          setAccess(accessData);
        }

        if (userRes.ok) {
          setUser(userData.user);
        }

        if (progressRes.ok && progressData.progress) {
          setCompletedLessons(new Set(progressData.progress.completedLessons));
        }

        if (searchParams.get("success") === "true" && !accessData?.allowed) {
          for (let attempt = 0; attempt < 5; attempt += 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const [nextAccessRes, nextUserRes] = await Promise.all([
              fetch(`/api/course/access/${courseId}`, { cache: "no-store" }),
              fetch("/api/auth/me", { cache: "no-store" }),
            ]);

            const nextAccessData = await nextAccessRes.json();
            const nextUserData = await nextUserRes.json();

            const hasPurchasedCourse = Array.isArray(nextUserData.user?.purchasedCourses)
              && nextUserData.user.purchasedCourses.some(
                (id: string) => String(id) === courseId
              );

            if (nextAccessData?.allowed || hasPurchasedCourse) {
              setAccess(nextAccessData);
              if (nextUserRes.ok) {
                setUser(nextUserData.user);
              }
              break;
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch course data:", error);
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId, searchParams]);

  const handleLessonClick = (lessonId: string) => {
    router.push(`/course/${params.id}/lesson/${lessonId}`);
  };

  const handleUnlockPremium = async () => {
    if (!course) return;
    setUnlockError("");
    setUnlockLoading(true);
    try {
      console.log("Initiating Stripe checkout for course:", params.id);
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Invalid session URL received");
      }
    } catch (e: unknown) {
      console.error("Unlock flow error:", e);
      setUnlockError(e instanceof Error ? e.message : "Unlock failed");
      setUnlockLoading(false);
    }
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

  if (access?.category === "premium" && !access.allowed) {
    const isPurchased = user?.purchasedCourses?.some(
      (id) => String(id) === courseId
    );
    
    if (!isPurchased) {
      return (
        <div className="min-h-screen flex flex-col bg-background">
          <Navbar />
          <main className="flex-1 container mx-auto px-6 pt-32 pb-20">
            <div className="max-w-2xl mx-auto">
              <h1 className="font-display text-4xl md:text-5xl text-text-primary mb-2">
                {course.title}
              </h1>
              <p className="text-text-muted text-lg mb-8">{course.description}</p>

              <div className="rounded-xl border border-border-gold bg-surface p-6">
                <h2 className="font-display text-2xl text-text-primary mb-2">
                  Premium Course Locked
                </h2>
                <p className="text-text-muted mb-4">
                  Complete payment to unlock this course.
                </p>

                <div className="text-text-primary font-semibold mb-4">
                  Price: Rs. {access.price?.toLocaleString()}
                </div>

                {unlockError && (
                  <div className="mb-3 rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                    {unlockError}
                  </div>
                )}

                <button
                  onClick={handleUnlockPremium}
                  disabled={unlockLoading}
                  className="rounded bg-[#d4af37] px-6 py-3 text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {unlockLoading ? "Redirecting to Stripe..." : "Unlock Premium"}
                </button>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      );
    }
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

          {access?.category === "free" && (
            <div className="rounded-xl border border-border-gold bg-surface p-4 mb-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-text-primary">Free Course</p>
                  <p className="text-xs text-text-muted">Start learning anytime.</p>
                </div>
                <button
                  onClick={() => {
                    const el = document.getElementById("course-content-anchor");
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="rounded bg-[#d4af37] px-4 py-2 text-xs font-bold text-black"
                >
                  Start Free
                </button>
              </div>
            </div>
          )}

          <div id="course-content-anchor" className="space-y-4">
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

          {course.modules && course.modules.length > 0 && (
            <div className="mt-10 space-y-6">
              <h2 className="font-display text-3xl text-text-primary">Course Content</h2>
              {course.modules.map((module, moduleIndex) => (
                <div
                  key={module._id ?? `${module.title}-${moduleIndex}`}
                  className="rounded-lg border border-border-gold bg-surface p-6"
                >
                  <h3 className="mb-4 font-display text-xl text-text-primary">
                    Module {moduleIndex + 1}: {module.title}
                  </h3>

                  {module.videos && module.videos.length > 0 && (
                    <div className="mb-6 space-y-4">
                      <p className="text-sm font-semibold uppercase tracking-widest text-gold">
                        Videos
                      </p>
                      {module.videos.map((video) => (
                        <div key={video._id ?? video.url} className="space-y-2">
                          <p className="text-sm text-text-primary">{video.title}</p>
                          <video controls className="w-full rounded-md bg-black">
                            <source src={video.url} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      ))}
                    </div>
                  )}

                  {module.resources && module.resources.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold uppercase tracking-widest text-gold">
                        PDFs
                      </p>
                      {module.resources.map((resource) => (
                        <a
                          key={resource._id ?? resource.url}
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-sm text-blue-300 underline underline-offset-4 hover:text-blue-200"
                        >
                          View PDF: {resource.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
