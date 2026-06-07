import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import { Message } from "@/models/message.model"
import { User } from "@/models/users.model"
import { verifySession } from "@/lib/session"

async function requireAdmin(req) {
  const raw = req.cookies.get("session")?.value
  if (!raw) return null
  const session = verifySession(raw)
  if (!session?.uid) return null
  const user = await User.findOne({ uid: session.uid }).lean()
  if (!["admin", "moderator"].includes(user?.role)) return null
  return user
}

export async function GET(req) {
  await dbConnect()
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const messages = await Message.find({})
    .populate("sender", "username role uid ffUid")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean()

  return NextResponse.json({ success: true, messages })
}

export async function DELETE(req) {
  await dbConnect()
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { messageId } = await req.json()
  if (!messageId) return NextResponse.json({ error: "Message ID required" }, { status: 400 })

  await Message.findByIdAndDelete(messageId)
  return NextResponse.json({ success: true })
}