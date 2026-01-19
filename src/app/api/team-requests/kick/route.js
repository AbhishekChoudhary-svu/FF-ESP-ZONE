import dbConnect from "@/lib/dbConnect"
import { Team } from "@/models/teams.model"
import { Player } from "@/models/players.model"

export async function PATCH(req) {
  await dbConnect()

  const { teamId, captainId, targetPlayerId } = await req.json()

  const team = await Team.findById(teamId)
  if (!team) {
    return Response.json({ success: false, message: "Team not found" })
  }

  
  if (team.teamCaptain.toString() !== captainId) {
    return Response.json({ success: false, message: "Unauthorized" })
  }

  
  if (captainId === targetPlayerId) {
    return Response.json({
      success: false,
      message: "Captain cannot kick himself",
    })
  }

  
  team.players = team.players.filter(
    (id) => id.toString() !== targetPlayerId
  )
  await team.save()

 
  await Player.findByIdAndUpdate(targetPlayerId, { teamId: null })

  return Response.json({ success: true, message: "Player kicked" })
}
