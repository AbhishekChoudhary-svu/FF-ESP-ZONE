// src/app/api/notifications/broadcast/route.js  (Next.js)

import { NextResponse }              from "next/server"
import dbConnect                     from "@/lib/dbConnect"
import { User }                      from "@/models/users.model"
import { verifySession }             from "@/lib/session"
import { broadcastNotification }     from "@/lib/notificationService"

export async function POST(req) {
  try {
    const raw = req.cookies.get("session")?.value
    if (!raw) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const session = verifySession(raw)
    if (!session?.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await dbConnect()

    const user = await User.findOne({ uid: session.uid }, { role: 1 }).lean()
    if (!user || !["admin", "moderator"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { title, message, type } = body

    if (!title?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 })
    }

    await broadcastNotification({
      title:   title.trim(),
      message: message.trim(),
      type:    type || "announcement",
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[broadcast route]:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}