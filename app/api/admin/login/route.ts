import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Simple Admin Login API Route
 * URL: /api/admin/login
 */
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1. Get admin credentials from environment variables
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    // 2. Validate against env variables
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // 3. Create a simple session token (base64 of email for simplicity as requested)
      const sessionToken = Buffer.from(email).toString("base64");

      // 4. Store session in a cookie
      const cookieStore = await cookies();
      cookieStore.set("admin_session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
      });

      return NextResponse.json(
        { message: "Login successful", token: sessionToken },
        { status: 200 }
      );
    }

    // 5. Invalid credentials
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
