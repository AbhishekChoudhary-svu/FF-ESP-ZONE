import { TeamRequest } from "@/models/teamReq.model"
import { Team } from "@/models/teams.model"
import { Player } from "@/models/players.model"
import dbConnect from "@/lib/dbConnect"


export async function PATCH(req) {
   await dbConnect();

  const { requestId, playerId } = await req.json()

  const request = await TeamRequest.findById(requestId)
    .populate("team")
    .populate("player")

  if (!request || request.status !== "pending") {
    return Response.json({ success: false, message: "Invalid request" })
  }

  
  if (request.player.teamId) {
    return Response.json({
      success: false,
      message: "Player already in a team",
    })
  }

 
  if (
    request.type === "invite" &&
    request.player._id.toString() !== playerId
  ) {
    return Response.json({ success: false, message: "Unauthorized" })
  }

  if (
    request.type === "request" &&
    request.team.teamCaptain.toString() !== playerId
  ) {
    return Response.json({ success: false, message: "Unauthorized" })
  }

  
  if (request.team.players.length >= 4) {
    return Response.json({ success: false, message: "Team full" })
  }

  
  request.team.players.push(request.player._id)
  await request.team.save()

  request.player.teamId = request.team._id
  await request.player.save()

  
  await TeamRequest.findByIdAndDelete(request._id)

  
  await TeamRequest.deleteMany({
    player: request.player._id,
    status: "pending",
  })

  return Response.json({ success: true })
}
