import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import { OfficialEvent } from "@/models/officialEvent.model"
import { User } from "@/models/users.model"
import { verifySession } from "@/lib/session"
import { checkApiLimit } from "@/lib/rateLimit"

// GET all published official events
export async function GET(req) {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const type   = searchParams.get("type")
    const page   = parseInt(searchParams.get("page")  || "1")
    const limit  = parseInt(searchParams.get("limit") || "20")
    const skip   = (page - 1) * limit

    const filter = { isPublished: true }
    if (status) filter.status = status
    if (type)   filter.type   = type

    const [events, total] = await Promise.all([
      OfficialEvent.find(filter)
        .populate("organizer", "username role")
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      OfficialEvent.countDocuments(filter),
    ])

    return NextResponse.json({
      success: true,
      events,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error("GET /api/official-events error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// POST create official event — admin/moderator only
export async function POST(req) {
  const ip = req.headers.get("x-forwarded-for") ??
             req.headers.get("x-real-ip") ??
             "unknown"

  try {
    await checkApiLimit(ip)

    const raw = req.cookies.get("session")?.value
    if (!raw) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const session = verifySession(raw)
    if (!session?.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await dbConnect()

    const user = await User.findOne({ uid: session.uid }).lean()
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    if (!["admin", "moderator"].includes(user.role)) {
      return NextResponse.json(
        { error: "Only admins and moderators can create official events" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      title,
      description,
      summary,
      type,
      prizePool,
      prizeDistribution,
      entryFee,
      rules,
      bannerImage,
      registrationLink,
      startDate,
      endDate,
      tags,
      isPublished,
      isPinned,
    } = body

    if (!title || !description || !summary) {
      return NextResponse.json(
        { error: "Title, description and summary are required" },
        { status: 400 }
      )
    }

    const event = await OfficialEvent.create({
      title,
      description,
      summary,
      type:              type || "tournament",
      prizePool:         prizePool || 0,
      prizeDistribution: prizeDistribution || [],
      entryFee:          entryFee || 0,
      rules:             rules || "",
      bannerImage:       bannerImage || "",
      registrationLink:  registrationLink || "",
      startDate:         startDate ? new Date(startDate) : null,
      endDate:           endDate ? new Date(endDate) : null,
      tags:              tags || [],
      isPublished:       isPublished ?? true,
      isPinned:          isPinned ?? false,
      organizer:         user._id,
      organizerName:     user.username,
    })

    return NextResponse.json(
      { success: true, message: "Event created successfully", event },
      { status: 201 }
    )
  } catch (err) {
    console.error("POST /api/official-events error:", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}