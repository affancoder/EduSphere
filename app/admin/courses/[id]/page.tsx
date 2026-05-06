"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

type Video = { _id?: string; title: string; url: string };
type Resource = { _id?: string; title: string; url: string; type: "pdf" };
type Module = { _id: string; title: string; videos: Video[]; resources: Resource[] };
type Course = { _id: string; title: string; modules: Module[] };

export default function AdminCourseContentPage() {
  console.log("COMPONENT LOADED: /admin/courses/[id]");
  const params = useParams<{ id: string }>();
  const courseId = params?.id;
  const videoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const pdfInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [course, setCourse] = useState<Course | null>(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [videoTitles, setVideoTitles] = useState<Record<string, string>>({});
  const [pdfTitles, setPdfTitles] = useState<Record<string, string>>({});
  const [videoFiles, setVideoFiles] = useState<Record<string, File | null>>({});
  const [pdfFiles, setPdfFiles] = useState<Record<string, File | null>>({});
  const [busy, setBusy] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [inputVersion, setInputVersion] = useState<Record<string, number>>({});

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
    console.log("Starting upload for file:", file.name);
    const form = new FormData();
    form.append("file", file);
    
    try {
      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
        // Important: Do NOT set Content-Type header manually for FormData
      });

      const contentType = uploadRes.headers.get("content-type");
      
      if (!contentType || !contentType.includes("application/json")) {
        const text = await uploadRes.text();
        console.error("Non-JSON response received from server:", text);
        throw new Error("Server returned an invalid response format (HTML instead of JSON). Check if you are logged in as admin.");
      }

      const uploadData = await uploadRes.json();
      console.log("Upload response data:", uploadData);

      if (!uploadRes.ok) {
        throw new Error(uploadData.error || "Upload failed");
      }

      return uploadData.url as string;
    } catch (err) {
      console.error("uploadFile caught error:", err);
      throw err;
    }
  };

  const onVideoUpload = async (moduleId: string, file: File) => {
    console.log("clicked Upload Video");
    console.log("video file:", file);
    const title = (videoTitles[moduleId] || file.name).trim();
    if (!title) return;
    setBusy(`video-${moduleId}`);
    setError("");
    setSuccess("");
    try {
      const url = await uploadFile(file);
      const saveRes = await fetch(`/api/admin/course/${courseId}/module/${moduleId}/video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url }),
      });
      if (!saveRes.ok) {
        const saveError = await saveRes.json();
        console.log("save video error response:", saveError);
        throw new Error(saveError.error || "Failed to attach video to module");
      }
      const saveData = await saveRes.json();
      console.log("save video response:", saveData);
      setVideoTitles((prev) => ({ ...prev, [moduleId]: "" }));
      setVideoFiles((prev) => ({ ...prev, [moduleId]: null }));
      setInputVersion((prev) => ({ ...prev, [`video-${moduleId}`]: (prev[`video-${moduleId}`] ?? 0) + 1 }));
      setSuccess("Video uploaded successfully");
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
    console.log("clicked Upload PDF");
    console.log("pdf file:", file);
    const title = (pdfTitles[moduleId] || file.name).trim();
    if (!title) return;
    setBusy(`pdf-${moduleId}`);
    setError("");
    setSuccess("");
    try {
      const url = await uploadFile(file);
      const saveRes = await fetch(`/api/admin/course/${courseId}/module/${moduleId}/resource`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, type: "pdf" }),
      });
      if (!saveRes.ok) {
        const saveError = await saveRes.json();
        console.log("save pdf error response:", saveError);
        throw new Error(saveError.error || "Failed to attach PDF to module");
      }
      const saveData = await saveRes.json();
      console.log("save pdf response:", saveData);
      setPdfTitles((prev) => ({ ...prev, [moduleId]: "" }));
      setPdfFiles((prev) => ({ ...prev, [moduleId]: null }));
      setInputVersion((prev) => ({ ...prev, [`pdf-${moduleId}`]: (prev[`pdf-${moduleId}`] ?? 0) + 1 }));
      setSuccess("PDF uploaded successfully");
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
    return (
      <div className="text-white/70">
        <button
          onClick={() => console.log("CLICKED TEST BUTTON (loading state)")}
          className="mb-4 rounded bg-white px-3 py-2 text-sm text-black"
          style={{ position: "relative", zIndex: 9999, pointerEvents: "auto" }}
        >
          Click Test
        </button>
        Loading course content...
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* <button
        onClick={() => console.log("CLICKED TEST BUTTON (rendered state)")}
        className="rounded bg-white px-3 py-2 text-sm text-black"
        style={{ position: "relative", zIndex: 9999, pointerEvents: "auto" }}
      >
        Click Test
      </button> */}
      <h1 className="text-3xl font-display">{course.title}</h1>
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          {success}
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
                key={`video-input-${module._id}-${inputVersion[`video-${module._id}`] ?? 0}`}
                ref={(el) => {
                  videoInputRefs.current[module._id] = el;
                }}
                type="file"
                accept="video/mp4"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  console.log("selected video file:", file);
                  setVideoFiles((prev) => ({ ...prev, [module._id]: file }));
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => {
                  console.log("clicked Choose Video button (UI)");
                  setError("");
                  const input = videoInputRefs.current[module._id];
                  if (!input) {
                    setError("Video input not ready. Try again.");
                    return;
                  }
                  input.click();
                }}
                disabled={busy === `video-${module._id}`}
                className="rounded border border-white/20 px-3 py-2 text-xs text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ position: "relative", zIndex: 50, pointerEvents: "auto" }}
              >
                Choose MP4
              </button>
              {videoFiles[module._id] && (
                <p className="mt-1 text-xs text-white/60">
                  Selected: {videoFiles[module._id]!.name}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  console.log("clicked Upload Video button (UI)");
                  const file = videoFiles[module._id];
                  if (!file) {
                    setError("Please select an MP4 file first.");
                    return;
                  }
                  void onVideoUpload(module._id, file);
                }}
                disabled={busy === `video-${module._id}`}
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
                key={`pdf-input-${module._id}-${inputVersion[`pdf-${module._id}`] ?? 0}`}
                ref={(el) => {
                  pdfInputRefs.current[module._id] = el;
                }}
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  console.log("selected pdf file:", file);
                  setPdfFiles((prev) => ({ ...prev, [module._id]: file }));
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => {
                  console.log("clicked Choose PDF button (UI)");
                  setError("");
                  const input = pdfInputRefs.current[module._id];
                  if (!input) {
                    setError("PDF input not ready. Try again.");
                    return;
                  }
                  input.click();
                }}
                disabled={busy === `pdf-${module._id}`}
                className="rounded border border-white/20 px-3 py-2 text-xs text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ position: "relative", zIndex: 50, pointerEvents: "auto" }}
              >
                Choose PDF
              </button>
              {pdfFiles[module._id] && (
                <p className="mt-1 text-xs text-white/60">
                  Selected: {pdfFiles[module._id]!.name}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  console.log("clicked Upload PDF button (UI)");
                  const file = pdfFiles[module._id];
                  if (!file) {
                    setError("Please select a PDF file first.");
                    return;
                  }
                  void onPdfUpload(module._id, file);
                }}
                disabled={busy === `pdf-${module._id}`}
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
