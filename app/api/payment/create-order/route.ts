import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Course from "@/models/Course";
import RazorpayOrder from "@/models/RazorpayOrder";
import razorpay from "@/lib/razorpay";

const currency = "INR";

const getAccessCategory = (
  course: {
    accessCategory?: string;
    isPremium?: boolean;
    category?: string;
  }
): "free" | "premium" => {
  if (course?.accessCategory === "premium") return "premium";
  if (course?.isPremium === true) return "premium";
  if (course?.category === "premium") return "premium";
  return "free";
};

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = (await request.json()) as { courseId?: string };
    const { courseId } = body;
    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    await connectDB();
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const accessCategory = getAccessCategory(course);
    if (accessCategory !== "premium") {
      return NextResponse.json(
        { error: "Course is not premium" },
        { status: 400 }
      );
    }

    const rupees = Number(course.price ?? 0);
    if (!Number.isFinite(rupees) || rupees <= 0) {
      return NextResponse.json(
        { error: "Invalid course price" },
        { status: 400 }
      );
    }

    const amountPaise = Math.round(rupees * 100);

    // Receipt helps trace orders; Razorpay requires a string.
    const receipt = crypto
      .randomBytes(10)
      .toString("hex")
      .slice(0, 20);

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency,
      receipt,
    });

    await RazorpayOrder.create({
      userId: decoded.id,
      courseId: course._id,
      amount: amountPaise,
      razorpayOrderId: order.id,
      status: "pending",
      lastSignature: "",
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("create-order error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}

