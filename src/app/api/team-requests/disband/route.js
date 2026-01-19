import dbConnect from "@/lib/dbConnect"
import { Team } from "@/models/teams.model"
import { Player } from "@/models/players.model"

export async function DELETE(req) {
  await dbConnect()

  const { teamId, captainId } = await req.json()

  const team = await Team.findById(teamId)
  if (!team) {
    return Response.json({ success: false, message: "Team not found" })
  }

  
  if (team.teamCaptain.toString() !== captainId) {
    return Response.json({ success: false, message: "Unauthorized" })
  }

  
  await Player.updateMany(
    { teamId: team._id },
    { teamId: null }
  )

  
  await Team.findByIdAndDelete(teamId)

  return Response.json({
    success: true,
    message: "Team disbanded successfully",
  })
}
