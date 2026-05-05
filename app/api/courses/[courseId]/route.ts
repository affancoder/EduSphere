import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    await connectDB();
    const course = await Course.findById(params.courseId);
    
    if (!course) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
    }

    const lessons = await Lesson.find({ courseId: params.courseId }).sort({ order: 1 });

    return NextResponse.json({ success: true, course, lessons }, { status: 200 });
  } catch (error: any) {
    console.error(`API Course Detail Error [${params.courseId}]:`, error);
    return NextResponse.json({ success: false, error: "Failed to fetch course details" }, { status: 500 });
  }
}
