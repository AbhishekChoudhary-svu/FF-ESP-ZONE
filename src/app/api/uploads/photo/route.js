import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { getPublicIdFromUrl } from "@/lib/cloudinary-utils";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("photos");

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "No photos uploaded" },
        { status: 400 }
      );
    }

    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "players/photos",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );

        stream.end(buffer);
      });
    });

    const urls = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      urls,
    });
  } catch (error) {
    console.error("PHOTO CLIP UPLOAD ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}


export async function DELETE(req) {
  try {
    const { photoUrls } = await req.json();

    if (!photoUrls || photoUrls.length === 0) {
      return NextResponse.json(
        { success: false, message: "Photo URLs required" },
        { status: 400 }
      );
    }

    const deletePromises = photoUrls.map((url) => {
      const publicId = getPublicIdFromUrl(url);
      return cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
      });
    });

    await Promise.all(deletePromises);

    return NextResponse.json({
      success: true,
      message: "Photo clip(s) deleted",
    });
  } catch (error) {
    console.error("PHOTO DELETE ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
