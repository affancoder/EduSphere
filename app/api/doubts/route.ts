import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Doubt from "@/models/Doubt";

// Ensure this route is always dynamic to fetch fresh data from MongoDB
export const dynamic = "force-dynamic";

/**
 * GET API route to fetch doubts from the database.
 * Supports filtering by status via query parameter: ?status=pending
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Get query parameters
    const status = req.nextUrl.searchParams.get("status");

    // 2. Establish database connection
    await connectDB();

    // 3. Build query object with proper typing
    const query: { status?: string } = {};
    if (status && ["pending", "understood"].includes(status)) {
      query.status = status;
    }

    // 4. Fetch recent doubts based on query
    // Selecting only necessary fields for performance and limiting to 20 results
    const doubts = await Doubt.find(query)
      .select("question subject status createdAt")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    
    // 5. Return the doubts as a JSON array
    return NextResponse.json(doubts, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching doubts (/api/doubts):", error);
    
    return NextResponse.json(
      { 
        error: "Failed to fetch doubts from the database.",
        message: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * POST API route to create a new doubt.
 * Accepts: { question: string, subject: string }
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Parse request body safely
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    const { question, subject } = body;

    // 2. Validate input
    if (!question || typeof question !== "string" || question.trim() === "") {
      return NextResponse.json(
        { error: "Question is required and cannot be empty." },
        { status: 400 }
      );
    }

    // 3. Connect to Database
    await connectDB();

    // 4. Create new doubt
    const newDoubt = await Doubt.create({
      question: question.trim(),
      subject: subject || "General",
      status: "pending",
    });

    // 5. Return the created document
    return NextResponse.json(newDoubt, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error creating doubt (/api/doubts):", error);
    return NextResponse.json(
      { 
        error: "An unexpected error occurred while creating the doubt.",
        message: error.message 
      },
      { status: 500 }
    );
  }
}
