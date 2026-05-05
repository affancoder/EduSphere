import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";

type SafeUser = {
  _id: string;
  email: string;
  role: "user" | "admin";
  name: string;
};

const getAdminWhitelist = () => {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
};

const isWhitelistedEmail = (email?: string) => {
  if (!email) return false;
  return getAdminWhitelist().has(email.toLowerCase());
};

export const hasAdminAccess = (user: Pick<SafeUser, "role" | "email">) => {
  return user.role === "admin" || isWhitelistedEmail(user.email);
};

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return {
      user: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const decoded = verifyToken(token);
  if (!decoded?.id) {
    return {
      user: null,
      response: NextResponse.json({ error: "Invalid token" }, { status: 401 }),
    };
  }

  await connectDB();
  const user = await User.findById(decoded.id)
    .select("name email role")
    .lean<SafeUser | null>();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "User not found" }, { status: 404 }),
    };
  }

  if (!hasAdminAccess(user)) {
    return {
      user: null,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { user, response: null };
}
