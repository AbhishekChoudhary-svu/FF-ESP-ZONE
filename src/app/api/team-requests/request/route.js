import { TeamRequest } from "@/models/teamReq.model"
import {Team} from "@/models/teams.model"
import {Player} from "@/models/players.model"
import dbConnect from "@/lib/dbConnect"


export async function POST(req) {
  await dbConnect()
  const { teamId, playerId, userId } = await req.json()

  const player = await Player.findById(playerId)
  if (!player || player.teamId) {
    return Response.json({ success: false, message: "Already in a team" })
  }

  const request = await TeamRequest.create({
    team: teamId,
    player: playerId,
    type: "request",
    createdBy: userId,
  })

  return Response.json({ success: true, request })
}
