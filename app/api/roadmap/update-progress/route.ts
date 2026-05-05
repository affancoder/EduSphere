import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import Roadmap from "@/models/Roadmap";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { roadmapId, topicIdx, isCompleted } = await req.json();

    if (roadmapId === undefined || topicIdx === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId: decoded.id });
    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
    }

    if (roadmap.topics[topicIdx]) {
      roadmap.topics[topicIdx].isCompleted = isCompleted;
      
      // Check if all topics are completed
      const allCompleted = roadmap.topics.every((t: any) => t.isCompleted);
      if (allCompleted) {
        roadmap.status = "completed";
      } else {
        roadmap.status = "active";
      }

      await roadmap.save();
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Update Progress Error:", error);
    return NextResponse.json(
      { error: "Failed to update your progress." },
      { status: 500 }
    );
  }
}
