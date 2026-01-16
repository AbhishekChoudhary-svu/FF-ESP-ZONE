import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { getPublicIdFromUrl } from "@/lib/cloudinary-utils";

export const runtime = "nodejs";


export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("logo");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Team logo file is required" },
        { status: 400 }
      );
    }

    // file -> buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "team/logos",
            resource_type: "image",
            transformation: [
              { width: 300, height: 300, crop: "fill" },
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
        logoUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("TEAM LOGO UPLOAD ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Logo upload failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { logoUrl } = await req.json();

    if (!logoUrl) {
      return NextResponse.json(
        { success: false, message: "Logo URL is required" },
        { status: 400 }
      );
    }

    const publicId = getPublicIdFromUrl(logoUrl);

    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    return NextResponse.json({
      success: true,
      message: "Team logo deleted successfully",
    });
  } catch (error) {
    console.error("TEAM LOGO DELETE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete logo" },
      { status: 500 }
    );
  }
}
