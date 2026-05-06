import { NextResponse } from "next/server";
import Stripe from "stripe";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Subscription from "@/models/Subscription";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  console.log("🚀 WEBHOOK HIT");

  await connectDB();

  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    console.error("Webhook Error:", err instanceof Error ? err.message : err);
    return new Response("Webhook Error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session: unknown = event.data.object;

    console.log("METADATA:", (session as Stripe.Checkout.Session).metadata);

    const userId = (session as Stripe.Checkout.Session).metadata?.userId;
    const courseId = (session as Stripe.Checkout.Session).metadata?.courseId;

    if (!userId || !courseId) {
      console.log("❌ Missing metadata");
      return NextResponse.json({ received: true });
    }

    try {
      // 🔓 Unlock course
      await User.findByIdAndUpdate(userId, {
        $addToSet: { purchasedCourses: courseId },
      });

      // 💰 Save transaction
      await Subscription.create({
        userId,
        courseId,
        amount: (session as Stripe.Checkout.Session).amount_total! / 100,
        status: "paid",
        stripeSessionId: (session as Stripe.Checkout.Session).id,
        createdAt: new Date(),
      });

      console.log("✅ Course unlocked & transaction saved");

    } catch (err: unknown) {
      console.error("DB ERROR:", err instanceof Error ? err.message : err);
    }
  }

  return NextResponse.json({ received: true });
}