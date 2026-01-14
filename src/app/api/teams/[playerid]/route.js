import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Team } from "@/models/teams.model";
import { Player } from "@/models/players.model";

export async function POST(req, { params }) {
  try {
    await dbConnect();

    const { playerid } = await params;
    const body = await req.json();

    const { name, tag, logo, region, tier } = body;

    if (!playerid || !name || !tag) {
      return NextResponse.json(
        { message: "playerId, name and tag are required" },
        { status: 400 }
      );
    }

    const player = await Player.findById(playerid);
    if (!player) {
      return NextResponse.json(
        { message: "Player not found" },
        { status: 404 }
      );
    }

    if (player.teamId) {
      return NextResponse.json(
        { message: "Player already in a team" },
        { status: 409 }
      );
    }

    const team = await Team.create({
      name,
      tag,
      logo: logo || "",
      captain: player._id,
      players: [player._id],
      region: region || "India",
      tier: tier || "Amateur",
      createdBy: player.userId,
    });

    // update player
    player.teamId = team._id;
    player.isCaptain = true;
    await player.save();

    return NextResponse.json(
      { success: true, team },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE TEAM ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function PATCH(req, { params }) {
  try {
    await dbConnect();

    const { playerid } = await params;
    const body = await req.json();

    const player = await Player.findById(playerid);
    if (!player || !player.teamId) {
      return NextResponse.json(
        { message: "Player or team not found" },
        { status: 404 }
      );
    }

    if (!player.isCaptain) {
      return NextResponse.json(
        { message: "Only captain can update team" },
        { status: 403 }
      );
    }

    const updates = {
      name: body.name,
      logo: body.logo,
      tier: body.tier,
      region: body.region,
      status: body.status,
    };

    Object.keys(updates).forEach(
      (k) => updates[k] === undefined && delete updates[k]
    );

    const team = await Team.findByIdAndUpdate(
      player.teamId,
      { $set: updates },
      { new: true }
    );

    return NextResponse.json(
      { success: true, team },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE TEAM ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { playerid } = await params;

    const player = await Player.findById(playerid);
    if (!player || !player.teamId) {
      return NextResponse.json(
        { message: "Player is not in a team" },
        { status: 404 }
      );
    }

    const team = await Team.findById(player.teamId)
      .populate({
        path: "players",
        populate: { path: "userId" },
      })
      .populate("captain");

    return NextResponse.json(
      { success: true, team },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET TEAM ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
