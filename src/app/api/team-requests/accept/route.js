import { TeamRequest } from "@/models/teamReq.model"
import {Team} from "@/models/teams.model"
import {Player} from "@/models/players.model"

export async function PATCH(req) {
  const { requestId, userId } = await req.json()

  const request = await TeamRequest.findById(requestId)
    .populate("team")
    .populate("player")

  if (!request || request.status !== "pending") {
    return Response.json({ success: false, message: "Invalid request" })
  }

  // Permission check
  if (
    (request.type === "invite" &&
      request.player.userId.toString() !== userId) ||
    (request.type === "request" &&
      request.team.teamCaptain.toString() !== userId)
  ) {
    return Response.json({ success: false, message: "Unauthorized" })
  }

  if (request.team.players.length >= 4) {
    return Response.json({ success: false, message: "Team full" })
  }

  // Add player to team
  request.team.players.push(request.player._id)
  await request.team.save()

  request.player.teamId = request.team._id
  await request.player.save()

  request.status = "accepted"
  await request.save()

  // Cancel other pending requests
  await TeamRequest.updateMany(
    {
      player: request.player._id,
      status: "pending",
      _id: { $ne: request._id },
    },
    { status: "cancelled" }
  )

  return Response.json({ success: true })
}
