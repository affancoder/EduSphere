"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import GoldButton from "../ui/GoldButton";

interface Course {
  _id: string;
  title: string;
  category: string;
  thumbnail: string;
  level: string;
}

export default function CoursesSection() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses");
        const data = await res.json();
        if (data.success) {
          // Show only top 3 for landing page
          setCourses(data.courses.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to fetch courses for landing page:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <section className="py-28 px-6 bg-surface/50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-gold text-xs tracking-[0.2em] uppercase font-body mb-4"
            >
              Curated Selection
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-5xl md:text-6xl text-text-primary"
            >
              Elite <span className="text-gold italic">Curriculums</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Link href="/courses">
              <GoldButton variant="ghost">View All Courses</GoldButton>
            </Link>
          </motion.div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-4/5 bg-surface/80 rounded-2xl mb-6" />
                <div className="h-8 bg-surface/80 rounded mb-2 w-3/4" />
                <div className="h-6 bg-surface/80 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <Link href={`/course/${course._id}`}>
                  <div className="relative aspect-4/5 overflow-hidden rounded-2xl mb-6">
                    <img
                      src={course.thumbnail || "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=800&auto=format&fit=crop"}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-background/90 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-background/80 backdrop-blur-md border border-white/10 rounded-full text-[10px] uppercase tracking-widest text-gold">
                        {course.category}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-display text-2xl text-text-primary mb-2 group-hover:text-gold transition-colors">
                    {course.title}
                  </h3>
                  <p className="font-body text-gold/80 text-lg uppercase tracking-widest text-xs font-bold">{course.level}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
