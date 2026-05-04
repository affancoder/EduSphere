"use client";

import { motion } from "framer-motion";
import GoldButton from "../ui/GoldButton";

const courses = [
  {
    title: "Mastering Digital Architecture",
    category: "Design",
    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=800&auto=format&fit=crop",
    price: "$299",
  },
  {
    title: "Strategic Financial Engineering",
    category: "Finance",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
    price: "$450",
  },
  {
    title: "Artificial Intelligence Ethics",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop",
    price: "$320",
  },
];

export default function CoursesSection() {
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
            <GoldButton variant="ghost">View All Courses</GoldButton>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-4/5 overflow-hidden rounded-2xl mb-6">
                <img
                  src={course.image}
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
              <p className="font-body text-gold/80 text-lg">{course.price}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
