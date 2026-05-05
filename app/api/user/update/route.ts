import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, hashPassword } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    const { name, email, profileImage, password } = await req.json();

    await connectDB();

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (profileImage) updateData.profileImage = profileImage;
    if (password) {
      updateData.password = await hashPassword(password);
    }

    const user = await User.findByIdAndUpdate(decoded.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
