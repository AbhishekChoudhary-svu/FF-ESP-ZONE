// File: /app/api/teams/active/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Team } from "@/models/teams.model";
import { Player } from "@/models/players.model";

export async function GET(req) {
  try {
    await dbConnect();

    const teams = await Team.find({ status: "active" })
      .populate({
        path: "players",
        populate: { path: "userId", select: "username avatar ffUid" },
      })
      .populate({
        path: "teamCaptain",
        populate: { path: "userId", select: "username avatar" },
      });

    return NextResponse.json({ success: true, teams }, { status: 200 });
  } catch (error) {
    console.error("GET ACTIVE TEAMS ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
