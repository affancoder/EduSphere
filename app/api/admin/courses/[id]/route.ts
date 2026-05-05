import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import Course from "@/models/Course";

type Params = { id: string };

type AdminCoursePayload = {
  title?: string;
  description?: string;
  thumbnail?: string;
  category?: "frontend" | "backend" | "security" | "other";
  isPremium?: boolean;
  price?: number;
  modules?: Array<{
    title?: string;
    videos?: Array<{ title?: string; url?: string }>;
  }>;
};

const validCategories = ["frontend", "backend", "security", "other"];

const normalizePayload = (payload: AdminCoursePayload) => ({
  title: payload.title?.trim(),
  description: payload.description?.trim(),
  thumbnail: payload.thumbnail?.trim() ?? "",
  category: payload.category,
  isPremium: Boolean(payload.isPremium),
  price: Number(payload.price ?? 0),
  modules: Array.isArray(payload.modules)
    ? payload.modules
        .filter((module) => module?.title?.trim())
        .map((module) => ({
          title: module.title!.trim(),
          videos: Array.isArray(module.videos)
            ? module.videos
                .filter((video) => video?.title?.trim() && video?.url?.trim())
                .map((video) => ({
                  title: video.title!.trim(),
                  url: video.url!.trim(),
                }))
            : [],
        }))
    : [],
});

const validatePayload = (payload: ReturnType<typeof normalizePayload>) => {
  if (!payload.title || !payload.description) {
    return "Title and description are required";
  }
  if (!payload.category || !validCategories.includes(payload.category)) {
    return "Invalid category";
  }
  if (Number.isNaN(payload.price) || payload.price < 0) {
    return "Price must be a positive number";
  }
  return null;
};

export async function PUT(
  request: Request,
  context: { params: Promise<Params> }
) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = (await request.json()) as AdminCoursePayload;
  const normalized = normalizePayload(body);
  const validationError = validatePayload(normalized);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const { id } = await context.params;
  const course = await Course.findByIdAndUpdate(id, normalized, {
    new: true,
    runValidators: true,
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  return NextResponse.json({ course });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<Params> }
) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await context.params;
  const course = await Course.findByIdAndDelete(id);
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Course deleted" });
}
