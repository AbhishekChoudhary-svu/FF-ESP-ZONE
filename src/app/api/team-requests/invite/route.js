import { TeamRequest } from "@/models/teamReq.model"
import {Team} from "@/models/teams.model"
import {Player} from "@/models/players.model"
import dbConnect from "@/lib/dbConnect"
import { sendNotification } from "@/lib/notificationService"


export async function POST(req) {
  await dbConnect()
  const { teamId, playerId, userId } = await req.json()

  const team = await Team.findById(teamId)
  if (!team) {
    return Response.json({ success: false, message: "Team not found" })
  }

 
  if (team.teamCaptain.toString() !== userId) {
    return Response.json({ success: false, message: "Not authorized" })
  }

  const player = await Player.findById(playerId)
  if (!player || player.teamId) {
    return Response.json({ success: false, message: "Player already in a team" })
  }

  const request = await TeamRequest.create({
    team: teamId,
    player: playerId,
    type: "invite",
    createdBy: userId,
  })
  await sendNotification({
  userId:  targetUser._id,
  title:   "Team Invitation 🛡",
  message: `${team.teamName} invited you to join their squad`,
  type:    "team",
  data:    { teamId: team._id },
})

  return Response.json({ success: true, request })
}
