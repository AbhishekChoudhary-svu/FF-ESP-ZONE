import { TeamRequest } from "@/models/teamReq.model"
import { Team } from "@/models/teams.model"
import { Player } from "@/models/players.model"
import { User } from "@/models/users.model"
import dbConnect from "@/lib/dbConnect"
import { sendNotification } from "@/lib/notificationService"

export async function PATCH(req) {
  await dbConnect()

  const { requestId, playerId } = await req.json()

  const request = await TeamRequest.findById(requestId)
    .populate("team")
    .populate("player")

  if (!request || request.status !== "pending") {
    return Response.json({ success: false, message: "Invalid request" })
  }

  if (request.player.teamId) {
    return Response.json({ success: false, message: "Player already in a team" })
  }

  if (request.type === "invite" && request.player._id.toString() !== playerId) {
    return Response.json({ success: false, message: "Unauthorized" })
  }

  if (request.type === "request" && request.team.teamCaptain.toString() !== playerId) {
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
  await TeamRequest.deleteMany({ player: request.player._id, status: "pending" })

  // ── Notifications ──────────────────────────────────────────
  // Get userId of the joining player to notify them
  const joiningPlayer = await Player.findById(request.player._id)
    .populate("userId", "_id")
    .lean()

  if (joiningPlayer?.userId?._id) {
    if (request.type === "invite") {
      // Player accepted an invite → notify the player they joined
      await sendNotification({
        userId:  joiningPlayer.userId._id,
        title:   "You Joined a Team 🛡",
        message: `You are now a member of ${request.team.teamName}`,
        type:    "team",
        data:    { teamId: request.team._id },
      })
    } else {
      // Captain accepted a join request → notify the player their request was accepted
      await sendNotification({
        userId:  joiningPlayer.userId._id,
        title:   "Join Request Accepted ✅",
        message: `${request.team.teamName} accepted your request to join`,
        type:    "team",
        data:    { teamId: request.team._id },
      })

      // Also notify captain that a new member joined
      const captain = await Player.findById(request.team.teamCaptain)
        .populate("userId", "_id")
        .lean()

      if (captain?.userId?._id) {
        const memberUser = await User.findById(joiningPlayer.userId._id)
          .select("username")
          .lean()

        await sendNotification({
          userId:  captain.userId._id,
          title:   "New Member Joined 🛡",
          message: `${memberUser?.username ?? "A player"} joined ${request.team.teamName}`,
          type:    "team",
          data:    { teamId: request.team._id },
        })
      }
    }
  }
  // ───────────────────────────────────────────────────────────

  return Response.json({ success: true })
}