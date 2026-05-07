import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Course from "@/models/Course";
import User from "@/models/User";

export async function GET(
  _request: Request,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await context.params;
    await connectDB();

    const course = await Course.findById(courseId).select(
      "_id title isPremium accessCategory price purchasedCourses"
    );
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const isPremium =
      course.accessCategory === "premium" || course.isPremium === true;

    if (!isPremium) {
      return NextResponse.json({
        allowed: true,
        category: "free",
        price: 0,
      });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({
        allowed: false,
        category: "premium",
        price: course.price ?? 0,
      });
    }

    const decoded = verifyToken(token);
    if (!decoded?.id) {
      return NextResponse.json(
        { allowed: false, category: "premium", price: course.price ?? 0 },
        { status: 401 }
      );
    }

    const user = await User.findById(decoded.id).select(
      "_id purchasedCourses"
    );
    if (!user) {
      return NextResponse.json(
        { allowed: false, category: "premium", price: course.price ?? 0 },
        { status: 404 }
      );
    }

    const hasAccess = user.purchasedCourses.some(
      (id: string | unknown) => String(id) === String(course._id)
    );

    if (hasAccess) {
      console.log("User has purchased course");
    }

    return NextResponse.json({
      allowed: hasAccess,
      category: "premium",
      price: course.price ?? 0,
    });
  } catch (error) {
    console.error("course access error:", error);
    return NextResponse.json(
      { error: "Failed to check course access" },
      { status: 500 }
    );
  }
}
