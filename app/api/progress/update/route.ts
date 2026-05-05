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
    const { courseId, completedLessons, totalLessons } = await req.json();

    await connectDB();

    let progress = await Progress.findOne({ userId: decoded.id, courseId });

    if (progress) {
      progress.completedLessons = completedLessons;
      if (totalLessons) progress.totalLessons = totalLessons;
      await progress.save();
    } else {
      progress = await Progress.create({
        userId: decoded.id,
        courseId,
        completedLessons,
        totalLessons,
      });
    }

    return NextResponse.json({ progress }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
