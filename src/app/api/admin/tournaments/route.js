import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import { Tournament } from "@/models/tournaments.model"
import { User } from "@/models/users.model"
import { verifySession } from "@/lib/session"

export async function GET(req) {
  await dbConnect()
  const raw = req.cookies.get("session")?.value
  if (!raw) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const session = verifySession(raw)
  const user    = await User.findOne({ uid: session?.uid }).lean()
  if (!["admin", "moderator"].includes(user?.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const filter = status ? { status } : {}

  const tournaments = await Tournament.find(filter)
    .populate("organizer", "username role")
    .sort({ createdAt: -1 })
    .lean()

  return NextResponse.json({ success: true, tournaments })
}