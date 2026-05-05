import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import Course from "@/models/Course";

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

const normalizePayload = (payload: AdminCoursePayload) => {
  const title = payload.title?.trim();
  const description = payload.description?.trim();
  const thumbnail = payload.thumbnail?.trim() ?? "";
  const category = payload.category;
  const isPremium = Boolean(payload.isPremium);
  const price = Number(payload.price ?? 0);
  const modules = Array.isArray(payload.modules)
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
    : [];

  return { title, description, thumbnail, category, isPremium, price, modules };
};

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

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const courses = await Course.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ courses });
}

export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = (await request.json()) as AdminCoursePayload;
  const normalized = normalizePayload(body);
  const validationError = validatePayload(normalized);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const course = await Course.create(normalized);
  return NextResponse.json({ course }, { status: 201 });
}
