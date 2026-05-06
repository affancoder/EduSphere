import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Course from "@/models/Course";
import User from "@/models/User";
import RazorpayOrder from "@/models/RazorpayOrder";

type VerifyBody = {
  courseId?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
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

    const body = (await request.json()) as VerifyBody;
    const { courseId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      body;

    if (
      !courseId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const [course, order, user] = await Promise.all([
      Course.findById(courseId),
      RazorpayOrder.findOne({
        razorpayOrderId: razorpay_order_id,
        userId: decoded.id,
        courseId,
      }),
      User.findById(decoded.id).select("_id purchasedCourses"),
    ]);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const sigBuf = Buffer.from(razorpay_signature, "utf8");
    const expBuf = Buffer.from(expectedSignature, "utf8");

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      await RazorpayOrder.updateOne(
        { _id: order._id },
        { $set: { status: "failed", lastSignature: razorpay_signature } }
      );
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Verify course is premium (defense-in-depth)
    const accessCategory =
      course?.accessCategory === "premium" || course?.isPremium === true
        ? "premium"
        : "free";
    if (accessCategory !== "premium") {
      await RazorpayOrder.updateOne(
        { _id: order._id },
        { $set: { status: "failed", lastSignature: razorpay_signature } }
      );
      return NextResponse.json(
        { error: "Course is not premium" },
        { status: 400 }
      );
    }

    await Promise.all([
      RazorpayOrder.updateOne(
        { _id: order._id },
        {
          $set: {
            status: "paid",
            razorpayPaymentId: razorpay_payment_id,
            lastSignature: razorpay_signature,
          },
        }
      ),
      User.updateOne(
        { _id: user._id },
        { $addToSet: { purchasedCourses: course._id } }
      ),
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("verify-payment error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}

