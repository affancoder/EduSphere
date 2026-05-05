import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/admin-auth";
import Course from "@/models/Course";

type Params = { courseId: string };

export async function POST(
  request: Request,
  context: { params: Promise<Params> }
) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { title } = (await request.json()) as { title?: string };
  if (!title?.trim()) {
    return NextResponse.json({ error: "Module title is required" }, { status: 400 });
  }

  const { courseId } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return NextResponse.json({ error: "Invalid course id" }, { status: 400 });
  }

  const moduleItem = {
    _id: new mongoose.Types.ObjectId(),
    title: title.trim(),
    videos: [],
    resources: [],
  };

  const course = await Course.findByIdAndUpdate(
    courseId,
    { $push: { modules: moduleItem } },
    { new: true }
  );

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  return NextResponse.json({ module: moduleItem, course });
}
