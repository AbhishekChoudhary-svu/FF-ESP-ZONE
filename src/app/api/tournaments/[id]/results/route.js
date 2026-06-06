import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import { Tournament } from "@/models/tournaments.model"
import { MatchResult } from "@/models/matchResult.model"
import { Player } from "@/models/players.model"
import { User } from "@/models/users.model"
import { verifySession } from "@/lib/session"

// ── Point tables ─────────────────────────────────────────────

const BR_SQUAD_DUO_POINTS = {
  1: 12, 2: 9, 3: 8, 4: 7, 5: 6,
  6: 5,  7: 4, 8: 3, 9: 2, 10: 1,
}

const BR_SOLO_POINTS = {
  1: 15, 2: 12, 3: 10, 4: 8,  5: 7,
  6: 6,  7: 5,  8: 4,  9: 3, 10: 2,
}

function getPlacementPoints(gameMode, teamMode, placement) {
  if (gameMode === "CS") return 0
  const table = teamMode === "Solo" ? BR_SOLO_POINTS : BR_SQUAD_DUO_POINTS
  return table[placement] ?? 0
}

function calculatePoints(gameMode, teamMode, row) {
  if (gameMode === "CS") {
    // Win = 3pts, each round won = 1pt
    const matchPts = (row.matchWins ?? 0) * 3
    const roundPts = row.roundsWon ?? 0
    return { placementPoints: matchPts, killPoints: roundPts, totalPoints: matchPts + roundPts }
  }
  // BR: placement + kills
  const placementPoints = getPlacementPoints(gameMode, teamMode, row.placement)
  const killPoints      = (row.kills ?? 0) * 1
  return { placementPoints, killPoints, totalPoints: placementPoints + killPoints }
}

// ── GET results for a tournament ─────────────────────────────
export async function GET(req, { params }) {
  try {
    await dbConnect()
    const { id } = await params

    const result = await MatchResult.findOne({ tournament: id })
      .populate({ path: "results.player", select: "avatar inGameRole isCaptain", populate: { path: "userId", select: "username ffUid" } })
      .populate("results.team", "teamName tag logo")
      .populate("submittedBy", "username role")
      .lean()

    if (!result) {
      return NextResponse.json({ error: "No results found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, result })
  } catch (err) {
    console.error("GET /api/tournaments/[id]/results error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// ── POST submit results ──────────────────────────────────────
export async function POST(req, { params }) {
  try {
    await dbConnect()

    const raw = req.cookies.get("session")?.value
    if (!raw) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const session = verifySession(raw)
    if (!session?.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await User.findOne({ uid: session.uid }).lean()
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const { id } = await params
    const tournament = await Tournament.findById(id)
    if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 })

    // Only organizer or admin/mod can submit
    const isOrg        = tournament.organizer.toString() === user._id.toString()
    const isPrivileged  = ["admin", "moderator"].includes(user.role)
    if (!isOrg && !isPrivileged) {
      return NextResponse.json({ error: "Not authorized to submit results" }, { status: 403 })
    }

    const body = await req.json()
    const { rows, notes } = body

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No result rows provided" }, { status: 400 })
    }

    const gameMode = tournament.gameMode
    const teamMode = tournament.teamMode

    // Build point system reference
    const pointSystem = {
      placementPoints: gameMode === "CS" ? {} : (teamMode === "Solo" ? BR_SOLO_POINTS : BR_SQUAD_DUO_POINTS),
      killPointValue:  gameMode === "CS" ? 0 : 1,
      winPoints:       gameMode === "CS" ? 3 : 0,
      lossPoints:      0,
      roundPointValue: gameMode === "CS" ? 1 : 0,
    }

    // Calculate points for each row
    const processedResults = rows.map((row) => {
      const { placementPoints, killPoints, totalPoints } = calculatePoints(gameMode, teamMode, row)
      return {
        player:          row.playerId,
        team:            row.teamId || null,
        placement:       Number(row.placement) || 0,
        kills:           Number(row.kills)     || 0,
        assists:         Number(row.assists)   || 0,
        deaths:          Number(row.deaths)    || 0,
        matchWins:       Number(row.matchWins)  || 0,
        matchLosses:     Number(row.matchLosses)|| 0,
        roundsWon:       Number(row.roundsWon)  || 0,
        roundsLost:      Number(row.roundsLost) || 0,
        placementPoints,
        killPoints,
        totalPoints,
        prize:           Number(row.prize)     || 0,
        isDisqualified:  row.isDisqualified    || false,
        disqualifyReason:row.disqualifyReason  || "",
      }
    })

    // Upsert MatchResult document
    const existing = await MatchResult.findOne({ tournament: id })
    let matchResult

    if (existing) {
      existing.results     = processedResults
      existing.pointSystem = pointSystem
      existing.submittedBy = user._id
      existing.submittedAt = new Date()
      existing.notes       = notes || ""
      matchResult = await existing.save()
    } else {
      matchResult = await MatchResult.create({
        tournament:  id,
        gameMode,
        teamMode,
        pointSystem,
        results:     processedResults,
        submittedBy: user._id,
        notes:       notes || "",
      })
    }

    // ── Update each participant's lifetime player stats ──────
    for (const row of processedResults) {
      if (!row.player || row.isDisqualified) continue

      const { placementPoints, killPoints, totalPoints } = calculatePoints(gameMode, teamMode, row)

      // Win = placement 1 for BR, or matchWins > matchLosses for CS
      const isWin = gameMode === "CS"
        ? (row.matchWins > row.matchLosses)
        : row.placement === 1

      await Player.findByIdAndUpdate(row.player, {
        $inc: {
          "stats.matchesPlayed": 1,
          "stats.kills":         row.kills,
          "stats.assists":       row.assists,
          "stats.deaths":        row.deaths,
          ...(isWin ? { "stats.wins": 1 } : {}),
        },
        $push: {
          tournamentHistory: {
            tournamentName: tournament.name,
            matchesPlayed:  1,
            kills:          row.kills,
            placement:      row.placement,
            points:         totalPoints,
            prize:          row.prize,
            date:           new Date(),
          },
        },
      })

      // Recalculate win rate
      const updatedPlayer = await Player.findById(row.player)
      if (updatedPlayer && updatedPlayer.stats.matchesPlayed > 0) {
        const winRate = Math.round(
          ((updatedPlayer.stats.wins || 0) / updatedPlayer.stats.matchesPlayed) * 100
        )
        await Player.findByIdAndUpdate(row.player, {
          $set: { "stats.winRate": winRate },
        })
      }
    }

    // ── Update tournament participants with placement + kills ─
    for (const row of processedResults) {
      await Tournament.updateOne(
        { _id: id, "participants.player": row.player },
        {
          $set: {
            "participants.$.placement": row.placement,
            "participants.$.kills":     row.kills,
          },
        }
      )
    }

    // ── Mark tournament as completed ─────────────────────────
    await Tournament.findByIdAndUpdate(id, { $set: { status: "completed" } })

    // Update user tournamentsJoined counts
    await User.updateMany(
      { _id: { $in: processedResults.map(r => r.player).filter(Boolean) } },
      { $inc: { tournamentsJoined: 1 } }
    )

    return NextResponse.json({
      success: true,
      message: "Results submitted and player stats updated",
      matchResult,
    })
  } catch (err) {
    console.error("POST /api/tournaments/[id]/results error:", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}