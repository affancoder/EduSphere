import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import Course from "@/models/Course";

type Params = { courseId: string; moduleId: string };

export async function POST(
  request: Request,
  context: { params: Promise<Params> }
) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const { title, url } = (await request.json()) as { title?: string; url?: string };
    if (!title?.trim() || !url?.trim()) {
      return NextResponse.json(
        { error: "Video title and url are required" },
        { status: 400 }
      );
    }
    try {
      const parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid URL protocol");
      }
    } catch {
      return NextResponse.json({ error: "Invalid video URL" }, { status: 400 });
    }

    const { courseId, moduleId } = await context.params;
    if (
      !mongoose.Types.ObjectId.isValid(courseId) ||
      !mongoose.Types.ObjectId.isValid(moduleId)
    ) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    await connectDB();

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const moduleDoc = course.modules?.id(moduleId);
    if (!moduleDoc) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    moduleDoc.videos.push({
      _id: new mongoose.Types.ObjectId(),
      title: title.trim(),
      url: url.trim(),
    });

    await course.save();
    return NextResponse.json({ success: true, course }, { status: 200 });
  } catch (error: unknown) {
    console.error("Video upload API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
