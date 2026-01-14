import { NextResponse } from "next/server";
import { Player } from "@/models/players.model";
import dbConnect from "@/lib/dbConnect";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    // unwrap params
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
