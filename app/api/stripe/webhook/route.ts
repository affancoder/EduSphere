import { NextResponse } from "next/server";
import Stripe from "stripe";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Purchase from "@/models/Purchase";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error("CRITICAL: STRIPE_SECRET_KEY is missing from environment variables (Webhook)");
}

const stripe = new Stripe(stripeSecretKey || "", {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(req: Request) {
  console.log("🚀 WEBHOOK HIT");

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    console.error("Stripe Webhook: No stripe-signature header found");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  if (!webhookSecret) {
    console.error("CRITICAL: STRIPE_WEBHOOK_SECRET is missing from environment variables");
    return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(`Stripe Webhook: Received event type: ${event.type}`);
  } catch (err: unknown) {
    console.error(
      `Stripe Webhook: Signature verification failed: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const courseId = session.metadata?.courseId;
    const paymentIntentId = session.payment_intent as string;
    const stripeSessionId = session.id;
    const amount = session.amount_total;

    console.log("USER:", userId);
    console.log("COURSE:", courseId);
    console.log("PAYMENT INTENT:", paymentIntentId);

    if (!userId || !courseId || !paymentIntentId || !stripeSessionId) {
      console.error("Missing transaction data");
      return NextResponse.json(
        { error: "Missing transaction data" },
        { status: 400 }
      );
    }

    try {
      await connectDB();

      // Prevent duplicate purchases
      const existingPurchase = await Purchase.findOne({
        userId,
        courseId,
      });

      if (existingPurchase) {
        console.log("Duplicate purchase prevented:", { userId, courseId });
        return NextResponse.json({ received: true, duplicate: true });
      }

      // Save purchase in MongoDB
      await Purchase.create({
        userId,
        courseId,
        stripePaymentIntentId: paymentIntentId,
        stripeSessionId: stripeSessionId,
        amount: amount ? amount / 100 : 0,
        currency: session.currency || "usd",
        status: "completed",
        purchasedAt: new Date(),
      });

      // Unlock course for user
      await User.findByIdAndUpdate(userId, {
        $addToSet: {
          purchasedCourses: courseId,
        },
      });

      const updatedUser = await User.findById(userId).select("purchasedCourses");
      const hasPurchasedCourse = updatedUser?.purchasedCourses?.some(
        (id: string | unknown) => String(id) === String(courseId)
      );

      if (!updatedUser || !hasPurchasedCourse) {
        console.error("Stripe Webhook: Failed to verify course purchase on user");
        return NextResponse.json(
          { error: "Failed to verify purchase" },
          { status: 500 }
        );
      }

      const savedPurchase = await Purchase.findOne({ stripeSessionId })
        .select("_id userId courseId stripePaymentIntentId stripeSessionId amount status purchasedAt")
        .lean();

      if (!savedPurchase) {
        console.error("Stripe Webhook: Failed to verify saved purchase");
        return NextResponse.json(
          { error: "Failed to verify purchase" },
          { status: 500 }
        );
      }

      console.log("Purchase saved successfully:", savedPurchase);
      console.log("Course successfully added to user");
    } catch (err: unknown) {
      console.error(
        "Stripe Webhook: Database operation failed:",
        err instanceof Error ? err.message : String(err)
      );
      return NextResponse.json({ error: "Database operation failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
