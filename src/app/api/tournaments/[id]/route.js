import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import { Tournament } from "@/models/tournaments.model"
import { User } from "@/models/users.model"
import { verifySession } from "@/lib/session"

// GET single tournament — public
export async function GET(req, { params }) {
  try {
    await dbConnect()

    const tournament = await Tournament.findById(params.id)
      .populate("organizer", "username role")
      .populate({
        path: "participants.player",
        select: "avatar inGameRole isCaptain",
        populate: { path: "userId", select: "username ffUid" },
      })
      .populate({
        path: "participants.team",
        select: "teamName tag logo",
      })
      .lean()

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 })
    }

    // Hide room credentials from non-participants until published
    const raw     = req.cookies.get("session")?.value
    const session = raw ? verifySession(raw) : null

    const isParticipant = session && tournament.participants.some(
      (p) => p.player?.userId?._id?.toString() === session.uid ||
             p.members?.some((m) => m.toString() === session.uid)
    )

    const isOrganizer = session && (
      tournament.organizer?._id?.toString() === session.uid ||
      ["admin", "moderator"].includes(session.role)
    )

    // Hide room credentials from non-participants
    if (!isParticipant && !isOrganizer) {
      tournament.roomId       = null
      tournament.roomPassword = null
    }

    return NextResponse.json({ success: true, tournament })
  } catch (err) {
    console.error("GET /api/tournaments/[id] error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// PATCH — update tournament (publish, add room credentials, change status)
// Only organizer, admin, or moderator
export async function PATCH(req, { params }) {
  try {
    const raw = req.cookies.get("session")?.value
    if (!raw) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const session = verifySession(raw)
    if (!session?.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await dbConnect()

    const [tournament, user] = await Promise.all([
      Tournament.findById(params.id),
      User.findOne({ uid: session.uid }).lean(),
    ])

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 })
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Only organizer or admin/moderator can update
    const isOrganizer = tournament.organizer.toString() === session.uid
    const isPrivileged = ["admin", "moderator"].includes(user.role)

    if (!isOrganizer && !isPrivileged) {
      return NextResponse.json({ error: "Not authorized to update this tournament" }, { status: 403 })
    }

    const body = await req.json()
    const {
      roomId,
      roomPassword,
      status,
      isPublished,
      name,
      description,
      rules,
      startDate,
      endDate,
      registrationDeadline,
      prizePool,
      prizeDistribution,
      bannerImage,
    } = body

    const updates = {}

    // Room credentials — publish room ID and password
    if (roomId !== undefined) {
      updates.roomId       = roomId
      updates.roomPassword = roomPassword
      updates.roomPublishedAt = new Date()
    }

    // Status change
    if (status) {
      const validTransitions = {
        draft:     ["upcoming", "cancelled"],
        upcoming:  ["ongoing", "cancelled"],
        ongoing:   ["completed", "cancelled"],
        completed: [],
        cancelled: [],
      }
      if (!validTransitions[tournament.status]?.includes(status)) {
        return NextResponse.json(
          { error: `Cannot transition from ${tournament.status} to ${status}` },
          { status: 400 }
        )
      }
      updates.status = status
    }

    // Publish/unpublish — only admin/moderator can publish paid tournaments
    if (isPublished !== undefined) {
      if (tournament.tournamentType === "paid" && !isPrivileged) {
        return NextResponse.json(
          { error: "Only admin or moderator can publish paid tournaments" },
          { status: 403 }
        )
      }
      updates.isPublished = isPublished
      if (isPublished) updates.status = "upcoming"
    }

    // Basic info updates — only when still in draft or upcoming
    if (["draft", "upcoming"].includes(tournament.status)) {
      if (name)                 updates.name                 = name
      if (description)          updates.description          = description
      if (rules)                updates.rules                = rules
      if (startDate)            updates.startDate            = new Date(startDate)
      if (endDate)              updates.endDate              = new Date(endDate)
      if (registrationDeadline) updates.registrationDeadline = new Date(registrationDeadline)
      if (prizePool !== undefined) updates.prizePool         = prizePool
      if (prizeDistribution)    updates.prizeDistribution    = prizeDistribution
      if (bannerImage)          updates.bannerImage          = bannerImage
    }

    const updated = await Tournament.findByIdAndUpdate(
      params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      message: "Tournament updated successfully",
      tournament: updated,
    })
  } catch (err) {
    console.error("PATCH /api/tournaments/[id] error:", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}

// DELETE — only admin can delete
export async function DELETE(req, { params }) {
  try {
    const raw = req.cookies.get("session")?.value
    if (!raw) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const session = verifySession(raw)
    if (!session?.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await dbConnect()

    const user = await User.findOne({ uid: session.uid }).lean()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can delete tournaments" }, { status: 403 })
    }

    const tournament = await Tournament.findById(params.id)
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 })
    }

    // Can't delete ongoing tournaments
    if (tournament.status === "ongoing") {
      return NextResponse.json(
        { error: "Cannot delete an ongoing tournament — cancel it first" },
        { status: 400 }
      )
    }

    await Tournament.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: "Tournament deleted successfully",
    })
  } catch (err) {
    console.error("DELETE /api/tournaments/[id] error:", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}