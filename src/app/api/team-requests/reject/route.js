import { TeamRequest } from "@/models/teamReq.model"
import {Team} from "@/models/teams.model"
import {Player} from "@/models/players.model"

export async function PATCH(req) {
  const { requestId, userId } = await req.json()

  const request = await TeamRequest.findById(requestId)

  if (!request || request.status !== "pending") {
    return Response.json({ success: false })
  }

  request.status = "rejected"
  await request.save()

  return Response.json({ success: true })
}
