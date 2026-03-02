import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
  try {
    const body = await req.json();
    const { imageData, folder = "doctors" } = body || {};

    if (!imageData) {
      return NextResponse.json(
        { success: false, message: "imageData is required" },
        { status: 400 }
      );
    }

    // imageData is expected to be a base64 data URL (data:image/jpeg;base64,...)
    const uploadResult = await cloudinary.uploader.upload(imageData, {
      folder,
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });
  } catch (error) {
    console.error("[upload-image] POST ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload image" },
      { status: 500 }
    );
  }
}

