import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";
import { sendResetEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email });

    // Always return same response (security)
    if (!user) {
      return NextResponse.json(
        {
          message:
            "If an account with that email exists, a reset link has been sent.",
        },
        { status: 200 }
      );
    }

    // 1. Generate raw token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 2. Hash token for DB storage
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // 3. Save hashed token + expiry
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

    // 4. Create reset link (RAW token goes in URL)
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL;

    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

    // 5. Send email
    await sendResetEmail(user.email, resetUrl);

    return NextResponse.json(
      {
        message:
          "If an account with that email exists, a reset link has been sent.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}