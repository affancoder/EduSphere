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
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const lessons = await Lesson.find({ courseId: params.courseId }).sort({ order: 1 });

    return NextResponse.json({ course, lessons }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 });
  }
}
