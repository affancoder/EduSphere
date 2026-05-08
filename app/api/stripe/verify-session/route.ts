import { NextResponse } from "next/server";
import Stripe from "stripe";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { finalizePaidCheckoutSession } from "@/lib/stripe-purchase";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error("CRITICAL: STRIPE_SECRET_KEY is missing from environment variables");
}

const stripe = new Stripe(stripeSecretKey || "", {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(request: Request) {
  try {
    console.log("Stripe verify: request received");
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const decoded = token ? verifyToken(token) : null;

    const body = (await request.json()) as { sessionId?: string };
    const sessionId = body.sessionId;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    console.log("Stripe verify: retrieving checkout session", { sessionId });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("Stripe Session:", session);
    console.log("Payment Status:", session.payment_status);
    console.log("Metadata:", session.metadata);

    if (session.payment_status !== "paid") {
      console.log("Stripe verify: session is not paid", {
        sessionId,
        paymentStatus: session.payment_status,
      });
      return NextResponse.json(
        { error: "Payment not completed", paymentStatus: session.payment_status },
        { status: 400 }
      );
    }

    const userId = session.metadata?.userId;
    const courseId = session.metadata?.courseId;
    console.log("User ID:", userId);
    console.log("Course ID:", courseId);

    if (!userId || !courseId) {
      return NextResponse.json({ error: "Missing session metadata" }, { status: 400 });
    }

    if (decoded?.id && String(userId) !== String(decoded.id)) {
      console.error("Stripe verify: session user mismatch", {
        sessionId,
        tokenUserId: decoded.id,
        sessionUserId: userId,
      });
      return NextResponse.json({ error: "Forbidden session access" }, { status: 403 });
    }

    if (!decoded?.id) {
      console.log(
        "Stripe verify: token not found/invalid, proceeding with Stripe metadata-based verification"
      );
    }

    const processed = await finalizePaidCheckoutSession(session);
    if (!processed.ok) {
      return NextResponse.json({ error: processed.error }, { status: 500 });
    }

    console.log("Stripe verify: purchase finalized", {
      sessionId,
      purchaseId: processed.purchaseId,
      duplicate: processed.duplicate ?? false,
    });
    return NextResponse.json({
      success: true,
      duplicate: processed.duplicate ?? false,
      purchaseId: processed.purchaseId,
      courseId,
    });
  } catch (error: unknown) {
    console.error("STRIPE PAYMENT VERIFY ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to verify Stripe payment session",
      },
      { status: 500 }
    );
  }
}
