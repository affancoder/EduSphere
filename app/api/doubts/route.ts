import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Doubt from "@/models/Doubt";

// Ensure this route is always dynamic to fetch fresh data from MongoDB
export const dynamic = "force-dynamic";

/**
 * GET API route to fetch all doubts from the database.
 * Doubts are sorted by 'createdAt' in descending order (latest first).
 */
export async function GET() {
  try {
    // 1. Establish database connection
    await connectDB();

    // 2. Fetch all doubts, sorted by newest first
    const doubts = await Doubt.find({}).sort({ createdAt: -1 }).lean();
    
    // 3. Return the doubts as a JSON array
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
