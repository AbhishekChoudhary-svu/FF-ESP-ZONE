import { TeamRequest } from "@/models/teamReq.model"
import { Team } from "@/models/teams.model"
import { Player } from "@/models/players.model"

export async function PATCH(req) {
  const { requestId, playerId } = await req.json()

  const request = await TeamRequest.findById(requestId)
    .populate("team")
    .populate("player")

  if (!request || request.status !== "pending") {
    return Response.json({ success: false, message: "Invalid request" })
  }

  // 🛑 Player already in a team
  if (request.player.teamId) {
    return Response.json({
      success: false,
      message: "Player already in a team",
    })
  }

  // ✅ PERMISSION CHECK
  // Team invited player → only THAT PLAYER can accept
  if (
    request.type === "invite" &&
    request.player._id.toString() !== playerId
  ) {
    return Response.json({ success: false, message: "Unauthorized" })
  }

  // Player requested team → only TEAM CAPTAIN can accept
  if (
    request.type === "request" &&
    request.team.teamCaptain.toString() !== playerId
  ) {
    return Response.json({ success: false, message: "Unauthorized" })
  }

  // 🛑 Team full
  if (request.team.players.length >= 4) {
    return Response.json({ success: false, message: "Team full" })
  }

  // ✅ Add player to team
  request.team.players.push(request.player._id)
  await request.team.save()

  request.player.teamId = request.team._id
  await request.player.save()

  // ✅ Update request
  request.status = "accepted"
  await request.save()

  // ❌ Cancel other pending requests of this player
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
