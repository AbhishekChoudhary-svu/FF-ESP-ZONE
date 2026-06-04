import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import { Tournament } from "@/models/tournaments.model"
import { Player } from "@/models/players.model"
import { verifySession } from "@/lib/session"
import { checkApiLimit } from "@/lib/rateLimit"

// GET all free tournaments
export async function GET(req) {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const status    = searchParams.get("status") || "upcoming"
    const gameMode  = searchParams.get("gameMode")
    const teamMode  = searchParams.get("teamMode")
    const page      = parseInt(searchParams.get("page") || "1")
    const limit     = parseInt(searchParams.get("limit") || "10")
    const skip      = (page - 1) * limit

    const filter = {
      tournamentType: "free",
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
    console.error("GET /api/tournaments/free error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// POST create free tournament — any captain can create
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

    // Must have a player profile to create a tournament
    const player = await Player.findOne({ userId: session.uid })
    if (!player) {
      return NextResponse.json(
        { error: "You must have a player profile to create a tournament" },
        { status: 403 }
      )
    }

    // Must be a captain
    if (!player.isCaptain) {
      return NextResponse.json(
        { error: "Only team captains can create tournaments" },
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
      registrationDeadline,
      startDate,
      endDate,
      prizePool,
      prizeDistribution,
      bannerImage,
      region,
    } = body

    // Validate required fields
    if (!name || !gameMode || !teamMode || !startDate || !endDate || !registrationDeadline) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
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
      registrationDeadline: new Date(registrationDeadline),
      startDate:            new Date(startDate),
      endDate:              new Date(endDate),
      prizePool:            prizePool || 0,
      prizeDistribution:    prizeDistribution || [],
      bannerImage:          bannerImage || "",
      region:               region || "India",
      tournamentType:       "free",
      entryFee:             0,
      organizer:            session.uid,
      organizerRole:        "user",
      isPublished:          true,    // free tournaments auto-publish
      status:               "upcoming",
    })

    return NextResponse.json(
      { success: true, message: "Tournament created successfully", tournament },
      { status: 201 }
    )
  } catch (err) {
    console.error("POST /api/tournaments/free error:", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}