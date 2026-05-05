"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Video = { title: string; url: string };
type Module = { title: string; videos: Video[] };
type Course = {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: "frontend" | "backend" | "security" | "other";
  isPremium: boolean;
  price: number;
  modules: Module[];
};

type CourseForm = {
  title: string;
  description: string;
  thumbnail: string;
  category: "frontend" | "backend" | "security" | "other";
  isPremium: boolean;
  price: number;
  modules: Module[];
};

const emptyCourse: CourseForm = {
  title: "",
  description: "",
  thumbnail: "",
  category: "other",
  isPremium: false,
  price: 0,
  modules: [],
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CourseForm>(emptyCourse);

  const loadCourses = async () => {
    const res = await fetch("/api/admin/courses");
    const data = await res.json();
    setCourses(data.courses ?? []);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadCourses();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyCourse);
  };

  const submit = async () => {
    const method = editingId ? "PUT" : "POST";
    const endpoint = editingId
      ? `/api/admin/courses/${editingId}`
      : "/api/admin/courses";

    await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    resetForm();
    loadCourses();
  };

  const remove = async (id: string) => {
    await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
    loadCourses();
  };

  const courseCountText = useMemo(() => `${courses.length} course(s)`, [courses]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display">Courses</h1>
        <p className="text-sm text-white/70">{courseCountText}</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="mb-4 text-lg font-semibold">
          {editingId ? "Edit Course" : "Add Course"}
        </h2>

        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />
          <input
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2"
            placeholder="Thumbnail URL"
            value={form.thumbnail}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, thumbnail: e.target.value }))
            }
          />
          <textarea
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 md:col-span-2"
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
          />
          <select
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2"
            value={form.category}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                category: e.target.value as Course["category"],
              }))
            }
          >
            <option value="frontend">frontend</option>
            <option value="backend">backend</option>
            <option value="security">security</option>
            <option value="other">other</option>
          </select>

          <input
            type="number"
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2"
            placeholder="Price"
            value={form.price}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, price: Number(e.target.value) }))
            }
          />
        </div>

        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isPremium}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, isPremium: e.target.checked }))
            }
          />
          Premium course
        </label>

        <div className="mt-4 flex gap-2">
          <button onClick={submit} className="rounded bg-[#d4af37] px-4 py-2 text-black">
            {editingId ? "Update" : "Create"}
          </button>
          {editingId && (
            <button onClick={resetForm} className="rounded border border-white/20 px-4 py-2">
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-left text-white/70">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course._id} className="border-t border-white/10">
                <td className="px-4 py-3">{course.title}</td>
                <td className="px-4 py-3">{course.category}</td>
                <td className="px-4 py-3">{course.isPremium ? "PREMIUM" : "FREE"}</td>
                <td className="px-4 py-3">{course.price}</td>
                <td className="flex gap-2 px-4 py-3">
                  <Link
                    href={`/admin/courses/${course._id}`}
                    className="rounded border border-blue-300/40 px-3 py-1 text-xs text-blue-200"
                  >
                    Content
                  </Link>
                  <button
                    onClick={() => {
                      setEditingId(course._id);
                      setForm({
                        title: course.title,
                        description: course.description,
                        thumbnail: course.thumbnail ?? "",
                        category: course.category,
                        isPremium: Boolean(course.isPremium),
                        price: course.price ?? 0,
                        modules: course.modules ?? [],
                      });
                    }}
                    className="rounded border border-white/20 px-3 py-1 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(course._id)}
                    className="rounded border border-red-400/40 px-3 py-1 text-xs text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
