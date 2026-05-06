import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Course from "@/models/Course";

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
      console.error("Stripe Checkout: No token found in cookies");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded?.id) {
      console.error("Stripe Checkout: Invalid or expired token");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { courseId } = body;
    console.log(`Stripe Checkout: Received request for courseId: ${courseId}, userId: ${decoded.id}`);

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Stripe Checkout: STRIPE_SECRET_KEY is undefined");
      return NextResponse.json({ error: "Stripe configuration error" }, { status: 500 });
    }

    await connectDB();
    const course = await Course.findById(courseId);
    if (!course) {
      console.error(`Stripe Checkout: Course not found for ID: ${courseId}`);
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Stripe expects amounts in cents/paise (smallest currency unit)
    const amount = Math.round(course.price * 100);
    console.log(`Stripe Checkout: Calculated amount in paise: ${amount}`);

    if (amount <= 0) {
      console.error(`Stripe Checkout: Invalid amount: ${amount}`);
      return NextResponse.json({ error: "Invalid course price" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    console.log(`Stripe Checkout: Using app URL: ${appUrl}`);

    console.log("Stripe Checkout: Creating session...");
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
      success_url: `${appUrl}/dashboard?success=true`,
      cancel_url: `${appUrl}/course/${courseId}?canceled=true`,
      metadata: {
        userId: decoded.id,
        courseId: courseId,
      },
    });

    console.log(`Stripe Checkout: Session created successfully. URL: ${session.url}`);
    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to create checkout session", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
