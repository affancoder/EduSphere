import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Doubt from "@/models/Doubt";

// Ensure this route is always dynamic to fetch fresh stats
export const dynamic = "force-dynamic";

/**
 * GET API route to fetch dashboard statistics.
 * URL: /api/stats
 */
export async function GET() {
  try {
    // 1. Establish database connection
    await connectDB();

    // 2. Run count operations in parallel for efficiency
    const [total, understood, pending] = await Promise.all([
      Doubt.countDocuments({}),
      Doubt.countDocuments({ status: "understood" }),
      Doubt.countDocuments({ status: "pending" }),
    ]);

    // 3. Return the statistics as a JSON object
    return NextResponse.json(
      { total, understood, pending },
      { 
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("❌ Error fetching statistics (/api/stats):", error);
    
    return NextResponse.json(
      { 
        error: "Failed to fetch dashboard statistics.",
        message: error.message 
      },
      { status: 500 }
    );
  }
}
