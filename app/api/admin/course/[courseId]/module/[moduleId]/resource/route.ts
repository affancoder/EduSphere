import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import Course from "@/models/Course";

type Params = { courseId: string; moduleId: string };

export async function POST(
  request: Request,
  context: { params: Promise<Params> }
) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const { title, url, type } = (await request.json()) as {
      title?: string;
      url?: string;
      type?: string;
    };

    if (!title?.trim() || !url?.trim()) {
      return NextResponse.json(
        { error: "Resource title and url are required" },
        { status: 400 }
      );
    }
    if (type && type !== "pdf") {
      return NextResponse.json({ error: "Only pdf type is supported" }, { status: 400 });
    }
    try {
      const parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid URL protocol");
      }
    } catch {
      return NextResponse.json({ error: "Invalid resource URL" }, { status: 400 });
    }

    const { courseId, moduleId } = await context.params;
    if (
      !mongoose.Types.ObjectId.isValid(courseId) ||
      !mongoose.Types.ObjectId.isValid(moduleId)
    ) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    await connectDB();

    const updateResult = await Course.updateOne(
      { _id: courseId, "modules._id": moduleId },
      {
        $push: {
          "modules.$.resources": {
            _id: new mongoose.Types.ObjectId(),
            title: title.trim(),
            url: url.trim(),
            type: "pdf",
          },
        },
      }
    );

    if (!updateResult.matchedCount) {
      return NextResponse.json(
        { error: "Course/module not found" },
        { status: 404 }
      );
    }

    const course = await Course.findById(courseId);
    return NextResponse.json({ success: true, course });
  } catch (error: unknown) {
    console.error("Resource upload API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
