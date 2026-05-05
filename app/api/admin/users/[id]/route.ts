import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import User from "@/models/User";

type Params = { id: string };

export async function PUT(
  request: Request,
  context: { params: Promise<Params> }
) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = (await request.json()) as { role?: "user" | "admin" };
  if (!body.role || !["user", "admin"].includes(body.role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const { id } = await context.params;
  const user = await User.findByIdAndUpdate(
    id,
    { role: body.role },
    { new: true, runValidators: true }
  ).select("name email role createdAt purchasedCourses");

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}
