import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db";
import Progress from "@/models/Progress";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    const { courseId, lessonId, completed, totalLessons } = await req.json();

    await connectDB();

    let progress = await Progress.findOne({ userId: decoded.id, courseId });

    if (progress) {
      const lessonSet = new Set(progress.completedLessons);
      if (completed) {
        lessonSet.add(lessonId);
      } else {
        lessonSet.delete(lessonId);
      }
      progress.completedLessons = Array.from(lessonSet);
      if (totalLessons) progress.totalLessons = totalLessons;
      await progress.save();
    } else {
      progress = await Progress.create({
        userId: decoded.id,
        courseId,
        completedLessons: completed ? [lessonId] : [],
        totalLessons: totalLessons || 0,
      });
    }

    return NextResponse.json({ progress }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
