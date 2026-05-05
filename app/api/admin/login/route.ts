import { NextResponse } from "next/server";

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
      return NextResponse.json(
        { success: true, message: "Login successful" },
        { status: 200 }
      );
    }

    // 3. Invalid credentials
    return NextResponse.json(
      { success: false, error: "Invalid email or password" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
