import { TeamRequest } from "@/models/teamReq.model"
import { Team } from "@/models/teams.model"
import { Player } from "@/models/players.model"
import dbConnect from "@/lib/dbConnect"

export async function PATCH(req) {
  await dbConnect()

  const { requestId, playerId } = await req.json()

  const request = await TeamRequest.findById(requestId)
    .populate("team")
    .populate("player")

  if (!request || request.status !== "pending") {
    return Response.json({
      success: false,
      message: "Invalid or already processed request",
    })
  }

  
  const isInviteReject =
    request.type === "invite" &&
    request.player._id.toString() === playerId

  const isJoinReject =
    request.type === "request" &&
    request.team.teamCaptain.toString() === playerId

  if (!isInviteReject && !isJoinReject) {
    return Response.json({
      success: false,
      message: "Unauthorized",
    })
  }

  
  await TeamRequest.findByIdAndDelete(requestId)

  return Response.json({
    success: true,
    message: "Request rejected and removed",
  })
}
