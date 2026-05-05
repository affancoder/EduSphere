import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Course from "@/models/Course";

export async function GET() {
  try {
    await connectDB();
    const courses = await Course.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, courses }, { status: 200 });
  } catch (error: any) {
    console.error("API Courses Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch courses" }, { status: 500 });
  }
}
