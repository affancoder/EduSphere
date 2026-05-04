import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Doubt from "@/models/Doubt";

/**
 * PATCH API route to update the status of a specific doubt.
 * URL: /api/doubts/[id]
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    // 1. Validate input
    if (!status || !["pending", "understood"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value. Must be 'pending' or 'understood'." },
        { status: 400 }
      );
    }

    // 2. Connect to Database
    await connectDB();

    // 3. Find and update the doubt
    const updatedDoubt = await Doubt.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedDoubt) {
      return NextResponse.json(
        { error: "Doubt not found." },
        { status: 404 }
      );
    }

    // 4. Return updated document
    return NextResponse.json(updatedDoubt, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating doubt:`, error);
    return NextResponse.json(
      { error: "Failed to update doubt." },
      { status: 500 }
    );
  }
}

/**
 * DELETE API route to remove a specific doubt by ID.
 * URL: /api/doubts/[id]
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Connect to Database
    await connectDB();

    // 2. Find and delete the doubt
    const deletedDoubt = await Doubt.findByIdAndDelete(id);

    if (!deletedDoubt) {
      return NextResponse.json(
        { error: "Doubt not found." },
        { status: 404 }
      );
    }

    // 3. Return success message
    return NextResponse.json(
      { message: "Doubt deleted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`Error deleting doubt:`, error);
    return NextResponse.json(
      { error: "Failed to delete doubt." },
      { status: 500 }
    );
  }
}
