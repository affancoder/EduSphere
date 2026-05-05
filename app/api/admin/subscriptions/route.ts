import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import Subscription from "@/models/Subscription";

export async function GET(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const user = searchParams.get("user");
  const course = searchParams.get("course");
  const status = searchParams.get("status");

  const query: Record<string, string> = {};
  if (user) query.userId = user;
  if (course) query.courseId = course;
  if (status && ["pending", "paid", "failed"].includes(status)) {
    query.status = status;
  }

  const subscriptions = await Subscription.find(query)
    .populate("userId", "name email")
    .populate("courseId", "title isPremium price")
    .sort({ createdAt: -1 })
    .lean();

  const paidSubscriptions = subscriptions.filter((s) => s.status === "paid");
  const revenue = paidSubscriptions.reduce(
    (sum, item) => sum + Number(item.amount ?? 0),
    0
  );

  return NextResponse.json({
    subscriptions,
    overview: {
      totalSubscriptions: subscriptions.length,
      paidSubscriptions: paidSubscriptions.length,
      revenue,
    },
  });
}
