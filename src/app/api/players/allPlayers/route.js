import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import {Player} from "@/models/players.model";

export async function GET() {
  try {
    await dbConnect();

    const players = await Player.find({ isActive: true })
      .populate("userId", "username email ffUid rank playstyle")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        players,
        count: players.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get active players error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch active players",
      },
      { status: 500 }
    );
  }
}
