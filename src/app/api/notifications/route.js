// src/app/api/notifications/route.js  (Next.js)

import { NextResponse }   from "next/server"
import dbConnect          from "@/lib/dbConnect"
import { Notification }   from "@/models/notification.model"
import { User }           from "@/models/users.model"
import { verifySession }  from "@/lib/session"

// ── Shared session → user helper ────────────────────────────────────────────
async function getUser(req) {
  const raw = req.cookies.get("session")?.value
  if (!raw) return null

  const session = verifySession(raw)
  if (!session?.uid) return null

  await dbConnect()
  return User.findOne({ uid: session.uid }, { _id: 1 }).lean()
}

// ── GET — fetch latest 50 notifications ─────────────────────────────────────
export async function GET(req) {
  try {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const countOnly = searchParams.get("count") === "1"

    const unreadCount = await Notification.countDocuments({ user: user._id, read: false })

    if (countOnly) {
      return NextResponse.json({ success: true, unreadCount })
    }

    const notifications = await Notification.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    return NextResponse.json({ success: true, notifications, unreadCount })
  } catch (err) {
    console.error("GET /api/notifications:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// ── PATCH — mark all as read ─────────────────────────────────────────────────
export async function PATCH(req) {
  try {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await Notification.updateMany({ user: user._id, read: false }, { $set: { read: true } })

    return NextResponse.json({ success: true, unreadCount: 0 })
  } catch (err) {
    console.error("PATCH /api/notifications:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// ── DELETE — clear all notifications ─────────────────────────────────────────
export async function DELETE(req) {
  try {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await Notification.deleteMany({ user: user._id })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/notifications:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}