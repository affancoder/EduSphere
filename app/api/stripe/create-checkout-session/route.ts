import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Course from "@/models/Course";
import Purchase from "@/models/Purchase";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error("CRITICAL: STRIPE_SECRET_KEY is missing from environment variables");
}

const stripe = new Stripe(stripeSecretKey || "", {
  apiVersion: "2026-04-22.dahlia",
});

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

    const body = await request.json();
    const { courseId } = body as { courseId?: string };
    const userId = decoded.id;

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    await connectDB();

    const course = await Course.findById(courseId).lean();
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const existingPurchase = await Purchase.findOne({
      userId,
      courseId,
      status: "completed",
    }).lean();

    if (existingPurchase) {
      return NextResponse.json(
        { error: "Course already purchased", alreadyPurchased: true },
        { status: 409 }
      );
    }

    const amount = Math.round((course.price ?? 0) * 100);
    if (amount <= 0) {
      return NextResponse.json({ error: "Invalid course price" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    console.log("Stripe Checkout: Creating session", { userId, courseId });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: course.title,
              description: course.description?.substring(0, 255) || "Course enrollment",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${appUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/courses`,
      metadata: {
        userId: String(userId),
        courseId: String(courseId),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error(
      "Stripe Checkout Error:",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
