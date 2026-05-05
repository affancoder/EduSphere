import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db";
import Doubt from "@/models/Doubt";

// Ensure this route is always dynamic to fetch fresh data from MongoDB
export const dynamic = "force-dynamic";

/**
 * GET API route to fetch user's doubts history from the database.
 */
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    await connectDB();

    const doubts = await Doubt.find({ userId: decoded.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    
    return NextResponse.json({ doubts }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching doubts (/api/doubts):", error);
    return NextResponse.json(
      { error: "Failed to fetch doubts." },
      { status: 500 }
    );
  }
}

/**
 * POST API route to create a new doubt with AI response.
 */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    const { question, subject } = await req.json();

    if (!question || typeof question !== "string" || question.trim() === "") {
      return NextResponse.json(
        { error: "Question is required." },
        { status: 400 }
      );
    }

    // Mock AI Response for now
    const mockAnswer = `AI Response to your question about ${subject || "General"}: \n\nRegarding your question: "${question}", here is a detailed explanation... [Mock AI Response]`;

    await connectDB();

    const newDoubt = await Doubt.create({
      userId: decoded.id,
      question: question.trim(),
      answer: mockAnswer,
      subject: subject || "General",
      status: "pending",
    });

    return NextResponse.json({ doubt: newDoubt }, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating doubt (/api/doubts):", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
