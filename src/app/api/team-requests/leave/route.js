import dbConnect from "@/lib/dbConnect"
import { Team } from "@/models/teams.model"
import { Player } from "@/models/players.model"

export async function PATCH(req) {
  await dbConnect()

  const { teamId, playerId } = await req.json()

  const team = await Team.findById(teamId)
  if (!team) {
    return Response.json({ success: false, message: "Team not found" })
  }

  
  if (team.teamCaptain.toString() === playerId) {
    return Response.json({
      success: false,
      message: "Captain must disband the team",
    })
  }

  
  team.players = team.players.filter(
    (id) => id.toString() !== playerId
  )
  await team.save()

  
  await Player.findByIdAndUpdate(playerId, { teamId: null })

  return Response.json({ success: true, message: "Left team successfully" })
}
