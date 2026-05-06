import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { userId, courseId } = body;

    console.log("CREATE SESSION DATA:", body);

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: "Missing userId or courseId" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Premium Course",
            },
            unit_amount: 3499900,
          },
          quantity: 1,
        },
      ],

      success_url: `${process.env.NEXT_PUBLIC_URL}/payment-success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/payment-failed`,

      // 🔥 CRITICAL FIX
      metadata: {
        userId: String(userId),
        courseId: String(courseId),
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error: unknown) {
    console.error("Stripe Session Error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}