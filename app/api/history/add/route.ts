import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db";
import LearningHistory from "@/models/LearningHistory";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    const { courseName, lessonName, timeSpent, completionStatus } = await req.json();

    await connectDB();

    const newHistory = await LearningHistory.create({
      userId: decoded.id,
      courseName,
      lessonName,
      timeSpent,
      completionStatus,
    });

    return NextResponse.json({ history: newHistory }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
