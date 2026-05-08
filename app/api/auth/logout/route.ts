import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return NextResponse.json({ message: "Logout successful" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
