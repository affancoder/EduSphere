import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db";
import LearningHistory from "@/models/LearningHistory";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const course = searchParams.get("course");
    const status = searchParams.get("status");

    await connectDB();

    const query: any = { userId: decoded.id };
    if (course) query.courseName = { $regex: course, $options: "i" };
    if (status) query.completionStatus = status;

    const history = await LearningHistory.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ history }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
