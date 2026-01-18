import { TeamRequest } from "@/models/teamReq.model"
import { Team } from "@/models/teams.model"
import {Player} from "@/models/players.model"
import dbConnect from "@/lib/dbConnect"

export async function GET(req) {
  await dbConnect()

  const { searchParams } = new URL(req.url)

  const playerId = searchParams.get("playerId")
  const teamId = searchParams.get("teamId")
  const userId = searchParams.get("userId")

  // ---------- PLAYER REQUESTS ----------
  if (playerId) {
    const requests = await TeamRequest.find({
      player: playerId,
      status: "pending",
    })
      .populate("team")
      .populate("createdBy")

    return Response.json({
      success: true,
      type: "player",
      requests,
    })
  }

  // ---------- TEAM (CAPTAIN) REQUESTS ----------
  if (teamId && playerId) {
    const team = await Team.findById(teamId)

    if (!team) {
      return Response.json({ success: false, message: "Team not found" })
    }

    // Only captain can see team requests
    if (team.teamCaptain.toString() !== playerId) {
      return Response.json({ success: false, message: "Not authorized" })
    }

    const requests = await TeamRequest.find({
      team: teamId,
      status: "pending",
    })
      .populate({
        path: "player",
        populate: { path: "userId", select: "username email" },
      })
      .populate("createdBy", "username")

    return Response.json({
      success: true,
      type: "team",
      requests,
    })
  }

  return Response.json({
    success: false,
    message: "Invalid query parameters",
  })
}
