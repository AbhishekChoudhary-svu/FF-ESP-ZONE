import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { Player } from "@/models/players.model";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    const {
      userId,
      avatar,
      teamId,
      inGameRole,
      isCaptain,
      clipPhotos,
      clipVideo,
      isActive,
    } = body;

    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 }
      );
    }

    
    const existingPlayer = await Player.findOne({ userId });
    if (existingPlayer) {
      return NextResponse.json(
        { success: false, message: "Player already exists for this user" },
        { status: 409 }
      );
    }

   
    if (clipPhotos && clipPhotos.length > 2) {
      return NextResponse.json(
        { success: false, message: "Maximum 2 photo clips allowed" },
        { status: 400 }
      );
    }

    
    const player = await Player.create({
      userId,
      avatar: avatar || "",
      teamId: teamId || null,
      inGameRole: inGameRole || "Rusher",
      isCaptain: isCaptain || false,
      clipPhotos: clipPhotos || [],
      clipVideo: clipVideo || "",
      isActive: isActive ?? true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Player created successfully",
        player,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE PLAYER ERROR:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
