import { NextResponse } from "next/server";
import { Player } from "@/models/players.model";
import dbConnect from "@/lib/dbConnect";

export async function POST(req, { params }) {
  try {
    await dbConnect();

    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      avatar,
      teamId,
      inGameRole,
      isCaptain,
      clipPhotos,
      clipVideo,
      isActive,
    } = body;

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
      isCaptain: Boolean(isCaptain),
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

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function PATCH(req, { params }) {
  try {
    await dbConnect();

    const { id: userId } = await params;
    const body = await req.json();

    if (!userId) {
      return NextResponse.json(
        { message: "UserId is required" },
        { status: 400 }
      );
    }

    const allowedUpdates = {
      avatar: body.avatar,
      inGameRole: body.inGameRole,
      isCaptain: body.isCaptain,
      isActive: body.isActive,
      clipPhotos: body.clipPhotos,
      clipVideo: body.clipVideo,
    };

   
    Object.keys(allowedUpdates).forEach(
      (key) => allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    const updatedPlayer = await Player.findOneAndUpdate(
      { userId },
      { $set: allowedUpdates },
      { new: true }
    ).populate("userId");

    if (!updatedPlayer) {
      return NextResponse.json(
        { message: "Player not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, player: updatedPlayer },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE PLAYER ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function GET(req, { params }) {
  try {
    await dbConnect();

    
    const { id: userId } = await params; 

    if (!userId) {
      return NextResponse.json({ message: "UserId is required" }, { status: 400 });
    }

    const player = await Player.findOne({ userId })
      .populate("userId")
      

    if (!player) {
      return NextResponse.json({ message: "Player not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, player }, { status: 200 });
  } catch (error) {
    console.error("GET PLAYER ERROR:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}