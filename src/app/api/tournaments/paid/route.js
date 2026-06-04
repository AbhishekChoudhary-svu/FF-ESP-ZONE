import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import { Tournament } from "@/models/tournaments.model"
import { User } from "@/models/users.model"
import { verifySession } from "@/lib/session"
import { checkApiLimit } from "@/lib/rateLimit"

// GET all paid tournaments
export async function GET(req) {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const status   = searchParams.get("status") || "upcoming"
    const gameMode = searchParams.get("gameMode")
    const teamMode = searchParams.get("teamMode")
    const page     = parseInt(searchParams.get("page") || "1")
    const limit    = parseInt(searchParams.get("limit") || "10")
    const skip     = (page - 1) * limit

    const filter = {
      tournamentType: "paid",
      isPublished: true,
    }

    if (status)   filter.status   = status
    if (gameMode) filter.gameMode = gameMode
    if (teamMode) filter.teamMode = teamMode

    const [tournaments, total] = await Promise.all([
      Tournament.find(filter)
        .populate("organizer", "username role")
        .sort({ startDate: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Tournament.countDocuments(filter),
    ])

    return NextResponse.json({
      success: true,
      tournaments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error("GET /api/tournaments/paid error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// POST create paid tournament — admin/moderator only
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

    // Fetch fresh user to check role
    const user = await User.findOne({ uid: session.uid }).lean()
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // Only admin or moderator can create paid tournaments
    if (!["admin", "moderator"].includes(user.role)) {
      return NextResponse.json(
        { error: "Only admins and moderators can create paid tournaments" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      name,
      description,
      rules,
      gameMode,
      teamMode,
      entryFee,
      prizePool,
      prizeDistribution,
      registrationDeadline,
      startDate,
      endDate,
      bannerImage,
      region,
    } = body

    // Validate required fields
    if (!name || !gameMode || !teamMode || !startDate || !endDate || !registrationDeadline) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!entryFee || entryFee <= 0) {
      return NextResponse.json(
        { error: "Paid tournaments must have an entry fee greater than 0" },
        { status: 400 }
      )
    }

    // CS only allows Squad
    if (gameMode === "CS" && teamMode !== "Squad") {
      return NextResponse.json(
        { error: "Clash Squad only supports Squad team mode" },
        { status: 400 }
      )
    }

    const tournament = await Tournament.create({
      name,
      description,
      rules,
      gameMode,
      teamMode,
      entryFee,
      prizePool:         prizePool || 0,
      prizeDistribution: prizeDistribution || [],
      registrationDeadline: new Date(registrationDeadline),
      startDate:            new Date(startDate),
      endDate:              new Date(endDate),
      bannerImage:          bannerImage || "",
      region:               region || "India",
      tournamentType:       "paid",
      organizer:            session.uid,
      organizerRole:        user.role,
      isPublished:          false,   // paid tournaments start as draft, admin publishes manually
      status:               "draft",
    })

    return NextResponse.json(
      { success: true, message: "Tournament created successfully", tournament },
      { status: 201 }
    )
  } catch (err) {
    console.error("POST /api/tournaments/paid error:", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}