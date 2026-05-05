import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db";
import Progress from "@/models/Progress";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    await connectDB();

    const progress = await Progress.findOne({ 
      userId: decoded.id, 
      courseId: params.courseId 
    });

    return NextResponse.json({ progress }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
