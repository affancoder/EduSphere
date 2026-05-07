import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import connectDB from "@/lib/db";
import Purchase from "@/models/Purchase";

export async function GET(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  await connectDB();

  const { searchParams } = new URL(request.url);
  const user = searchParams.get("user");
  const course = searchParams.get("course");
  const status = searchParams.get("status");

  const query: Record<string, string> = {};
  if (user) query.userId = user;
  if (course) query.courseId = course;
  if (status && ["pending", "completed", "failed", "refunded"].includes(status)) {
    query.status = status;
  }

  const purchases = await Purchase.find(query)
    .populate("userId", "name email")
    .populate("courseId", "title")
    .sort({ purchasedAt: -1 })
    .lean();

  const transactions = await Purchase.find({ status: "completed" })
    .populate("userId", "name email")
    .populate("courseId", "title")
    .sort({ purchasedAt: -1 })
    .lean();
  const totalRevenue = transactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount ?? 0),
    0
  );
  const totalSales = transactions.length;

  const completedPurchases = purchases.filter((s) => s.status === "completed");
  const revenue = completedPurchases.reduce(
    (sum, item) => sum + Number(item.amount ?? 0),
    0
  );

  // Calculate unique users and unique courses sold
  const uniqueUsers = new Set(completedPurchases.map((s) => s.userId?._id?.toString())).size;
  const uniqueCourses = new Set(completedPurchases.map((s) => s.courseId?._id?.toString())).size;

  console.log("Admin data fetched successfully");

  return NextResponse.json({
    subscriptions: purchases,
    totalRevenue,
    totalSales,
    transactions,
    overview: {
      totalSubscriptions: purchases.length,
      paidSubscriptions: completedPurchases.length,
      revenue,
      uniqueUsers,
      uniqueCourses,
    },
  });
}
