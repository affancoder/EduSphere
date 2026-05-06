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
    const amount = session.amount_total;
    const stripeSessionId = session.id;

    console.log("USER:", userId);
    console.log("COURSE:", courseId);

    if (!userId || !courseId || amount == null || !stripeSessionId) {
      console.error("Missing transaction data");
      return NextResponse.json(
        { error: "Missing transaction data" },
        { status: 400 }
      );
    }

    try {
      await connectDB();

      await User.findByIdAndUpdate(userId, {
        $addToSet: { purchasedCourses: courseId },
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

      const existingTransaction = await Subscription.findOne({ stripeSessionId })
        .select("_id")
        .lean();

      if (!existingTransaction) {
        await Subscription.create({
          userId,
          courseId,
          amount: amount / 100,
          status: "paid",
          stripeSessionId,
          createdAt: new Date(),
        });
      }

      const savedTransaction = await Subscription.findOne({ stripeSessionId })
        .select("_id userId courseId amount status stripeSessionId createdAt")
        .lean();

      if (!savedTransaction) {
        console.error("Stripe Webhook: Failed to verify saved transaction");
        return NextResponse.json(
          { error: "Failed to verify transaction" },
          { status: 500 }
        );
      }

      console.log("Transaction saved successfully");
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
