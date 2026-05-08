import type Stripe from "stripe";
import connectDB from "@/lib/db";
import Purchase from "@/models/Purchase";
import User from "@/models/User";

type PurchaseProcessResult = {
  ok: boolean;
  duplicate?: boolean;
  purchaseId?: string;
  error?: string;
};

export async function finalizePaidCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<PurchaseProcessResult> {
  console.log("Purchase finalize: Stripe Session:", session);
  console.log("Purchase finalize: Payment Status:", session.payment_status);
  console.log("Purchase finalize: Metadata:", session.metadata);

  const userId = session.metadata?.userId;
  const courseId = session.metadata?.courseId;
  const stripeSessionId = session.id;
  const stripePaymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? "";

  if (!userId || !courseId || !stripeSessionId || !stripePaymentIntentId) {
    console.error("Purchase finalize: missing required session metadata", {
      userId,
      courseId,
      stripeSessionId,
      stripePaymentIntentId,
    });
    return { ok: false, error: "Missing required transaction metadata" };
  }

  await connectDB();
  console.log("Purchase finalize: MongoDB connected");

  const existingPurchase = await Purchase.findOne({ userId, courseId }).lean();
  if (existingPurchase) {
    console.log("Course already purchased", { userId, courseId });
    return { ok: true, duplicate: true, purchaseId: String(existingPurchase._id) };
  }

  const createdPurchase = await Purchase.create({
    userId,
    courseId,
    stripeSessionId,
    stripePaymentIntentId,
    amount: session.amount_total ? session.amount_total / 100 : 0,
    status: session.payment_status === "paid" ? "completed" : "pending",
    purchasedAt: new Date(),
  });
  console.log("Purchase saved:", createdPurchase);

  const user = await User.findById(userId).select("purchasedCourses");
  if (!user) {
    console.error("Purchase finalize: user not found", { userId });
    return { ok: false, error: "User not found while unlocking course" };
  }

  const alreadyUnlocked = user.purchasedCourses.some(
    (id: string | unknown) => String(id) === String(courseId)
  );
  if (!alreadyUnlocked) {
    user.purchasedCourses.push(courseId);
    await user.save();
    console.log("Course unlocked for user", { userId, courseId });
  } else {
    console.log("Purchase finalize: course already unlocked on user", { userId, courseId });
  }

  return { ok: true, purchaseId: String(createdPurchase._id) };
}
