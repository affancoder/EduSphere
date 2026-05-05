import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import User from "@/models/User";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const users = await User.find()
    .select("name email role createdAt purchasedCourses")
    .populate("purchasedCourses", "title isPremium price")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ users });
}
