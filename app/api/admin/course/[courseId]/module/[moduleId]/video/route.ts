import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/admin-auth";
import Course from "@/models/Course";

type Params = { courseId: string; moduleId: string };

export async function POST(
  request: Request,
  context: { params: Promise<Params> }
) {
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

  const updateResult = await Course.updateOne(
    { _id: courseId, "modules._id": moduleId },
    {
      $push: {
        "modules.$.videos": {
          _id: new mongoose.Types.ObjectId(),
          title: title.trim(),
          url: url.trim(),
        },
      },
    }
  );

  if (!updateResult.matchedCount) {
    return NextResponse.json(
      { error: "Course/module not found" },
      { status: 404 }
    );
  }

  const course = await Course.findById(courseId);
  return NextResponse.json({ course });
}
