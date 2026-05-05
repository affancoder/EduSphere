import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import Doubt from "@/models/Doubt";
import { verifyToken } from "@/lib/auth";

export async function GET() {
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

    await connectDB();

    const history = await Doubt.find({ 
      userId: decoded.id,
      subject: "AI Assistant" // Filtering for specifically AI Assistant questions if needed, or remove to see all doubts
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

    return NextResponse.json({ success: true, history }, { status: 200 });
  } catch (error: any) {
    console.error("AI History Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI history." },
      { status: 500 }
    );
  }
}
