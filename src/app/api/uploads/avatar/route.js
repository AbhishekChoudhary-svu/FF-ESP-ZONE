import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { getPublicIdFromUrl } from "@/lib/cloudinary-utils";

export const runtime = "nodejs"; 

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("avatar");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Avatar file is required" },
        { status: 400 }
      );
    }

    // Convert file → buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "players/avatar",
            resource_type: "image",
            transformation: [
              { width: 300, height: 300, crop: "fill" }, // perfect avatar
              { quality: "auto" },
              { fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    return NextResponse.json(
      {
        success: true,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("AVATAR UPLOAD ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Upload failed" },
      { status: 500 }
    );
  }
}





export async function DELETE(req) {
  try {
    const { avatarUrl } = await req.json();

    if (!avatarUrl) {
      return NextResponse.json(
        { success: false, message: "Avatar URL required" },
        { status: 400 }
      );
    }

    const publicId = getPublicIdFromUrl(avatarUrl);

    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    return NextResponse.json({
      success: true,
      message: "Avatar deleted",
    });
  } catch (error) {
    console.error("AVATAR DELETE ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
