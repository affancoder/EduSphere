import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import Roadmap from "@/models/Roadmap";
import { verifyToken } from "@/lib/auth";

export async function GET() {
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

    await connectDB();

    const roadmaps = await Roadmap.find({ userId: decoded.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, roadmaps }, { status: 200 });
  } catch (error: any) {
    console.error("List Roadmaps Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch your learning paths." },
      { status: 500 }
    );
  }
}
