import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Lesson from "@/models/Lesson";
import Course from "@/models/Course";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const lesson = await Lesson.findById(params.id);
    
    if (!lesson) {
      return NextResponse.json({ success: false, error: "Lesson not found" }, { status: 404 });
    }

    const course = await Course.findById(lesson.courseId).select("title");
    
    // Find all lessons for this course to determine next/prev
    const allLessons = await Lesson.find({ courseId: lesson.courseId }).sort({ order: 1 });
    const currentIndex = allLessons.findIndex(l => l._id.toString() === params.id);
    
    const prevLessonId = currentIndex > 0 ? allLessons[currentIndex - 1]._id : null;
    const nextLessonId = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1]._id : null;

    return NextResponse.json({ 
      success: true,
      lesson, 
      courseTitle: course?.title,
      totalLessons: allLessons.length,
      prevLessonId,
      nextLessonId
    }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch lesson:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch lesson" }, { status: 500 });
  }
}
