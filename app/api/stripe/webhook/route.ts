import { NextResponse } from "next/server";
import Stripe from "stripe";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Subscription from "@/models/Subscription";

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

    console.log("USER:", userId);
    console.log("COURSE:", courseId);

    if (!userId || !courseId) {
      console.warn("Stripe Webhook: Missing userId or courseId in session metadata");
      return NextResponse.json({ received: true });
    }

    try {
      await connectDB();

      await User.findByIdAndUpdate(userId, {
        $addToSet: { purchasedCourses: courseId },
      });

      await Subscription.updateOne(
        { stripeSessionId: session.id },
        {
          $setOnInsert: {
            userId,
            courseId,
            amount: Number(session.amount_total ?? 0) / 100,
            status: "paid",
            stripeSessionId: session.id,
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );

      console.log("✅ Course unlocked & transaction saved");
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
