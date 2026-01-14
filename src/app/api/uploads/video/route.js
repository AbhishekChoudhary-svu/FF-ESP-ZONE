import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { getPublicIdFromUrl } from "@/lib/cloudinary-utils";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("video");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No video uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const videoUrl = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "players/videos",
          resource_type: "video",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      );

      stream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: videoUrl,
    });
  } catch (error) {
    console.error("VIDEO UPLOAD ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}




export async function DELETE(req) {
  try {
    const { videoUrl } = await req.json();

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, message: "Video URL required" },
        { status: 400 }
      );
    }

    const publicId = getPublicIdFromUrl(videoUrl);

    await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });

    return NextResponse.json({
      success: true,
      message: "Video deleted",
    });
  } catch (error) {
    console.error("VIDEO DELETE ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
