import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import { OfficialEvent } from "@/models/officialEvent.model"
import { User } from "@/models/users.model"
import { verifySession } from "@/lib/session"

// GET single event — increments view count
export async function GET(req, { params }) {
  try {
    await dbConnect()

    // FIX: params is a Promise in Next.js 15 — must be awaited
    const { id } = await params

    const event = await OfficialEvent.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .populate("organizer", "username role _id")
      .lean()

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, event })
  } catch (err) {
    console.error("GET /api/official-events/[id] error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// PATCH update event — creator or admin/moderator
export async function PATCH(req, { params }) {
  try {
    const raw = req.cookies.get("session")?.value
    if (!raw) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const session = verifySession(raw)
    if (!session?.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await dbConnect()

    // FIX: await params
    const { id } = await params

    const user = await User.findOne({ uid: session.uid }).lean()
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const event = await OfficialEvent.findById(id).lean()
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 })

    // Allow if admin/moderator OR the original creator
    const isCreator = String(event.organizer) === String(user._id)
    const isPrivileged = ["admin", "moderator"].includes(user.role)

    if (!isCreator && !isPrivileged) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const body    = await req.json()
    const updated = await OfficialEvent.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      message: "Event updated",
      event: updated,
    })
  } catch (err) {
    console.error("PATCH /api/official-events/[id] error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// DELETE — creator or admin
export async function DELETE(req, { params }) {
  try {
    const raw = req.cookies.get("session")?.value
    if (!raw) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const session = verifySession(raw)
    if (!session?.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await dbConnect()

    // FIX: await params
    const { id } = await params

    const user = await User.findOne({ uid: session.uid }).lean()
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const event = await OfficialEvent.findById(id).lean()
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 })

    // Allow if admin OR the original creator
    const isCreator = String(event.organizer) === String(user._id)
    const isAdmin   = user.role === "admin"

    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: "Not authorized to delete this event" }, { status: 403 })
    }

    await OfficialEvent.findByIdAndDelete(id)

    return NextResponse.json({ success: true, message: "Event deleted" })
  } catch (err) {
    console.error("DELETE /api/official-events/[id] error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}