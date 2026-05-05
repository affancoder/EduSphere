import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Progress from "@/models/Progress";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    await connectDB();
    const progress = await Progress.find({ userId: params.userId });
    return NextResponse.json({ progress }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}
