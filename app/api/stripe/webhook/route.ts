import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import connectDB from "@/lib/db";
import User from "@/models/User";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error("CRITICAL: STRIPE_SECRET_KEY is missing from environment variables (Webhook)");
}

const stripe = new Stripe(stripeSecretKey || "", {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    console.error("Stripe Webhook: No stripe-signature header found");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CRITICAL: STRIPE_WEBHOOK_SECRET is missing from environment variables");
    return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log(`Stripe Webhook: Received event type: ${event.type}`);
  } catch (err: unknown) {
    console.error(`Stripe Webhook: Signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, courseId } = session.metadata || {};
    console.log(`Stripe Webhook: Processing completed session for userId: ${userId}, courseId: ${courseId}`);

    if (userId && courseId) {
      try {
        await connectDB();
        const updatedUser = await User.findByIdAndUpdate(userId, {
          $addToSet: { purchasedCourses: courseId },
        });

        if (!updatedUser) {
          console.error(`Stripe Webhook: User ${userId} not found in database`);
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        console.log(`✅ Stripe Webhook: Course ${courseId} successfully unlocked for user ${userId}`);
      } catch (dbErr: unknown) {
        console.error("Stripe Webhook: Database update failed:", dbErr.message);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }
    } else {
      console.warn("Stripe Webhook: Missing userId or courseId in session metadata");
    }
  }

  return NextResponse.json({ received: true });
}
