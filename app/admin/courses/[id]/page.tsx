"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Video = { _id?: string; title: string; url: string };
type Resource = { _id?: string; title: string; url: string; type: "pdf" };
type Module = { _id: string; title: string; videos: Video[]; resources: Resource[] };
type Course = { _id: string; title: string; modules: Module[] };

export default function AdminCourseContentPage() {
  const params = useParams<{ id: string }>();
  const courseId = params?.id;
  const [course, setCourse] = useState<Course | null>(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [videoTitles, setVideoTitles] = useState<Record<string, string>>({});
  const [pdfTitles, setPdfTitles] = useState<Record<string, string>>({});
  const [videoFiles, setVideoFiles] = useState<Record<string, File | null>>({});
  const [pdfFiles, setPdfFiles] = useState<Record<string, File | null>>({});
  const [busy, setBusy] = useState<string>("");
  const [error, setError] = useState<string>("");

  const loadCourse = useCallback(async () => {
    if (!courseId) return;
    const res = await fetch(`/api/admin/courses`);
    const data = await res.json();
    const found = (data.courses ?? []).find((c: Course) => c._id === courseId) ?? null;
    setCourse(found);
  }, [courseId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadCourse();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadCourse]);

  const addModule = async () => {
    if (!moduleTitle.trim()) return;
    await fetch(`/api/admin/course/${courseId}/module`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: moduleTitle }),
    });
    setModuleTitle("");
    await loadCourse();
  };

  const uploadFile = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const uploadRes = await fetch("/api/admin/upload", {
      method: "POST",
      body: form,
    });
    if (!uploadRes.ok) {
      const error = await uploadRes.json();
      throw new Error(error.error || "Upload failed");
    }
    const uploadData = await uploadRes.json();
    return uploadData.secure_url as string;
  };

  const onVideoUpload = async (moduleId: string, file: File) => {
    const title = (videoTitles[moduleId] || file.name).trim();
    if (!title) return;
    setBusy(`video-${moduleId}`);
    setError("");
    try {
      const url = await uploadFile(file);
      const saveRes = await fetch(`/api/admin/course/${courseId}/module/${moduleId}/video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url }),
      });
      if (!saveRes.ok) {
        const saveError = await saveRes.json();
        throw new Error(saveError.error || "Failed to attach video to module");
      }
      setVideoTitles((prev) => ({ ...prev, [moduleId]: "" }));
      setVideoFiles((prev) => ({ ...prev, [moduleId]: null }));
      await loadCourse();
    } catch (uploadError: unknown) {
      const message =
        uploadError instanceof Error ? uploadError.message : "Video upload failed";
      setError(message);
    } finally {
      setBusy("");
    }
  };

  const onPdfUpload = async (moduleId: string, file: File) => {
    const title = (pdfTitles[moduleId] || file.name).trim();
    if (!title) return;
    setBusy(`pdf-${moduleId}`);
    setError("");
    try {
      const url = await uploadFile(file);
      const saveRes = await fetch(`/api/admin/course/${courseId}/module/${moduleId}/resource`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, type: "pdf" }),
      });
      if (!saveRes.ok) {
        const saveError = await saveRes.json();
        throw new Error(saveError.error || "Failed to attach PDF to module");
      }
      setPdfTitles((prev) => ({ ...prev, [moduleId]: "" }));
      setPdfFiles((prev) => ({ ...prev, [moduleId]: null }));
      await loadCourse();
    } catch (uploadError: unknown) {
      const message =
        uploadError instanceof Error ? uploadError.message : "PDF upload failed";
      setError(message);
    } finally {
      setBusy("");
    }
  };

  if (!course) {
    return <div className="text-white/70">Loading course content...</div>;
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-display">{course.title}</h1>
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={moduleTitle}
            onChange={(e) => setModuleTitle(e.target.value)}
            placeholder="Module title"
            className="flex-1 rounded border border-white/10 bg-black/30 px-3 py-2"
          />
          <button onClick={addModule} className="rounded bg-[#d4af37] px-4 py-2 text-black">
            + Add Module
          </button>
        </div>
      </div>

      {course.modules?.map((module, index) => (
        <div key={module._id} className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">
            Module {index + 1}: {module.title}
          </h2>

          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium text-white/80">Videos</p>
              <ul className="mb-3 list-inside list-disc text-sm text-white/70">
                {module.videos?.map((video) => (
                  <li key={video._id ?? video.url}>{video.title}</li>
                ))}
              </ul>
              <input
                value={videoTitles[module._id] ?? ""}
                onChange={(e) =>
                  setVideoTitles((prev) => ({ ...prev, [module._id]: e.target.value }))
                }
                placeholder="Video title"
                className="mb-2 w-full rounded border border-white/10 bg-black/30 px-3 py-2"
              />
              <input
                type="file"
                accept="video/mp4"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setVideoFiles((prev) => ({ ...prev, [module._id]: file ?? null }));
                }}
                disabled={busy === `video-${module._id}`}
                className="block w-full text-sm text-white/70"
              />
              <button
                onClick={() => {
                  const file = videoFiles[module._id];
                  if (file) void onVideoUpload(module._id, file);
                }}
                disabled={!videoFiles[module._id] || busy === `video-${module._id}`}
                className="mt-2 rounded bg-[#d4af37] px-3 py-2 text-xs text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy === `video-${module._id}` ? "Uploading video..." : "Upload Video"}
              </button>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-white/80">PDFs</p>
              <ul className="mb-3 list-inside list-disc text-sm text-white/70">
                {module.resources?.map((resource) => (
                  <li key={resource._id ?? resource.url}>{resource.title}</li>
                ))}
              </ul>
              <input
                value={pdfTitles[module._id] ?? ""}
                onChange={(e) =>
                  setPdfTitles((prev) => ({ ...prev, [module._id]: e.target.value }))
                }
                placeholder="PDF title"
                className="mb-2 w-full rounded border border-white/10 bg-black/30 px-3 py-2"
              />
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setPdfFiles((prev) => ({ ...prev, [module._id]: file ?? null }));
                }}
                disabled={busy === `pdf-${module._id}`}
                className="block w-full text-sm text-white/70"
              />
              <button
                onClick={() => {
                  const file = pdfFiles[module._id];
                  if (file) void onPdfUpload(module._id, file);
                }}
                disabled={!pdfFiles[module._id] || busy === `pdf-${module._id}`}
                className="mt-2 rounded bg-[#d4af37] px-3 py-2 text-xs text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy === `pdf-${module._id}` ? "Uploading PDF..." : "Upload PDF"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
