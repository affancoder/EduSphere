import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/admin-auth";

const MAX_VIDEO_SIZE_BYTES = 200 * 1024 * 1024;
const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;

const supportedVideoTypes = new Set(["video/mp4"]);
const supportedPdfType = "application/pdf";

const uploadWithStream = (
  fileBuffer: Buffer,
  options: { resource_type: "video" | "raw"; folder: string }
) =>
  new Promise<{ secure_url: string; resource_type: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        ...options,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Upload failed"));
          return;
        }
        resolve({
          secure_url: result.secure_url,
          resource_type: result.resource_type,
        });
      }
    );

    stream.end(fileBuffer);
  });

export async function POST(request: Request) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    let formData;
    try {
      formData = await request.formData();
    } catch (err) {
      console.error("FormData parsing error:", err);
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const isVideo = supportedVideoTypes.has(file.type);
    const isPdf = file.type === supportedPdfType;
    if (!isVideo && !isPdf) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Only mp4 and pdf are allowed.` },
        { status: 400 }
      );
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Video size must be <= 200MB" },
        { status: 400 }
      );
    }
    if (isPdf && file.size > MAX_PDF_SIZE_BYTES) {
      return NextResponse.json(
        { error: "PDF size must be <= 10MB" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    
    console.log(`Starting Cloudinary upload for ${file.name} (${file.type})`);
    
    const uploaded = await uploadWithStream(fileBuffer, {
      folder: "edusphere/lms",
      resource_type: isVideo ? "video" : "raw",
    });

    console.log("Cloudinary upload successful:", uploaded.secure_url);

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      url: uploaded.secure_url,
      resource_type: uploaded.resource_type,
    });
  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Internal server error during upload" 
      },
      { status: 500 }
    );
  }
}
