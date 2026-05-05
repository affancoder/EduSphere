import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";

export async function GET(
  _req: Request,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    await connectDB();
    const { courseId } = await context.params;
    const course = await Course.findById(courseId);
    
    if (!course) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
    }

    const lessons = await Lesson.find({ courseId }).sort({ order: 1 });

    // course includes modules/videos/resources directly (stored in MongoDB)
    return NextResponse.json({ success: true, course, lessons }, { status: 200 });
  } catch (error: unknown) {
    console.error("API Course Detail Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch course details" }, { status: 500 });
  }
}
