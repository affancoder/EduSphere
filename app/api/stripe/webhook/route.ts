import { NextResponse } from "next/server";
import Stripe from "stripe";
import { finalizePaidCheckoutSession } from "@/lib/stripe-purchase";

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
    console.log("Stripe webhook: checkout.session.completed", {
      sessionId: session.id,
      paymentStatus: session.payment_status,
    });

    if (session.payment_status !== "paid") {
      console.log("Stripe webhook: session not paid, skipping unlock", {
        sessionId: session.id,
        paymentStatus: session.payment_status,
      });
      return NextResponse.json({ received: true, skipped: true });
    }

    try {
      const processed = await finalizePaidCheckoutSession(session);
      if (!processed.ok) {
        console.error("Stripe webhook: finalize failed", {
          sessionId: session.id,
          error: processed.error,
        });
        return NextResponse.json({ error: processed.error }, { status: 500 });
      }

      console.log("Stripe webhook: finalize success", {
        sessionId: session.id,
        duplicate: processed.duplicate ?? false,
        purchaseId: processed.purchaseId,
      });
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
