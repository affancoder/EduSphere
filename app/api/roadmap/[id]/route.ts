import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import Roadmap from "@/models/Roadmap";
import { verifyToken } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const roadmap = await Roadmap.findOne({ 
      _id: id,
      userId: decoded.id 
    }).lean();

    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, roadmap }, { status: 200 });
  } catch (error: any) {
    console.error("Get Roadmap Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch roadmap details." },
      { status: 500 }
    );
  }
}
