import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db";
import Course from "@/models/Course";
import Subscription from "@/models/Subscription";
import User from "@/models/User";

type CreateSubscriptionPayload = {
  courseId?: string;
  amount?: number;
  status?: "pending" | "paid" | "failed";
};

export async function POST(request: Request) {
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded?.id) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const body = (await request.json()) as CreateSubscriptionPayload;
  const courseId = body.courseId;
  const status = body.status ?? "pending";
  const amount = Number(body.amount ?? 0);

  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }
  if (!["pending", "paid", "failed"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  if (Number.isNaN(amount) || amount < 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const [user, course] = await Promise.all([
    User.findById(decoded.id),
    Course.findById(courseId),
  ]);
  if (!user || !course) {
    return NextResponse.json(
      { error: "User or course not found" },
      { status: 404 }
    );
  }

  const subscription = await Subscription.create({
    userId: user._id,
    courseId: course._id,
    amount,
    status,
  });

  if (status === "paid") {
    await User.findByIdAndUpdate(user._id, {
      $addToSet: { purchasedCourses: course._id },
    });
  }

  return NextResponse.json({ subscription }, { status: 201 });
}
