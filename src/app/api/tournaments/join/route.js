import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import { Tournament } from "@/models/tournaments.model"
import { Player } from "@/models/players.model"
import { Team } from "@/models/teams.model"
import { User } from "@/models/users.model"
import { verifySession } from "@/lib/session"
import { checkApiLimit } from "@/lib/rateLimit"

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

    const { tournamentId, paymentId } = await req.json()
    if (!tournamentId) {
      return NextResponse.json({ error: "Tournament ID required" }, { status: 400 })
    }

    await dbConnect()

    const [tournament, player, user] = await Promise.all([
      Tournament.findById(tournamentId),
      Player.findOne({ userId: session.uid }).populate("teamId"),
      User.findOne({ uid: session.uid }).lean(),
    ])

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 })
    }

    if (!player) {
      return NextResponse.json(
        { error: "You must have a player profile to join" },
        { status: 403 }
      )
    }

    // Check tournament is open for registration
    if (!tournament.isPublished) {
      return NextResponse.json({ error: "Tournament is not published yet" }, { status: 400 })
    }

    if (tournament.status !== "upcoming") {
      return NextResponse.json({ error: "Registration is closed" }, { status: 400 })
    }

    if (new Date() > tournament.registrationDeadline) {
      return NextResponse.json({ error: "Registration deadline has passed" }, { status: 400 })
    }

    if (tournament.filledSlots >= tournament.totalSlots) {
      return NextResponse.json({ error: "Tournament is full" }, { status: 400 })
    }

    // ── Who can join based on teamMode ──────────────────────
    let members = []
    let teamRef = null

    if (tournament.teamMode === "Squad") {
      // Only captain can join squad tournaments
      if (!player.isCaptain) {
        return NextResponse.json(
          { error: "Only the team captain can join squad tournaments" },
          { status: 403 }
        )
      }

      const team = await Team.findById(player.teamId).populate("players")
      if (!team) {
        return NextResponse.json(
          { error: "You must be in a team to join squad tournaments" },
          { status: 403 }
        )
      }

      if (team.players.length < 4) {
        return NextResponse.json(
          { error: "Your team needs at least 4 players to join" },
          { status: 400 }
        )
      }

      members = team.players.slice(0, 4).map((p) => p._id)
      teamRef = team._id

      // Check none of the team members are already in this tournament
      const memberIds = members.map((id) => id.toString())
      const alreadyJoined = tournament.participants.some((p) =>
        p.members.some((m) => memberIds.includes(m.toString()))
      )
      if (alreadyJoined) {
        return NextResponse.json(
          { error: "One or more team members already joined this tournament" },
          { status: 409 }
        )
      }

    } else if (tournament.teamMode === "Duo") {
      // Captain joins with one partner from team
      if (!player.isCaptain) {
        return NextResponse.json(
          { error: "Only the team captain can register a duo" },
          { status: 403 }
        )
      }

      const team = await Team.findById(player.teamId).populate("players")
      if (!team || team.players.length < 2) {
        return NextResponse.json(
          { error: "Your team needs at least 2 players for duo registration" },
          { status: 400 }
        )
      }

      members = team.players.slice(0, 2).map((p) => p._id)
      teamRef = team._id

      const memberIds = members.map((id) => id.toString())
      const alreadyJoined = tournament.participants.some((p) =>
        p.members.some((m) => memberIds.includes(m.toString()))
      )
      if (alreadyJoined) {
        return NextResponse.json(
          { error: "You or your partner already joined this tournament" },
          { status: 409 }
        )
      }

    } else {
      // Solo — any player can join
      members = [player._id]

      const alreadyJoined = tournament.participants.some((p) =>
        p.player.toString() === player._id.toString()
      )
      if (alreadyJoined) {
        return NextResponse.json(
          { error: "You already joined this tournament" },
          { status: 409 }
        )
      }
    }

    // ── Payment check for paid tournaments ──────────────────
    if (tournament.tournamentType === "paid") {
      if (!paymentId) {
        return NextResponse.json(
          { error: "Payment required to join this tournament" },
          { status: 402 }
        )
      }
      // TODO: verify paymentId with your payment gateway here
    }

    // ── Add participant ─────────────────────────────────────
    tournament.participants.push({
      player:        player._id,
      team:          teamRef,
      members,
      paymentId:     paymentId || null,
      paymentStatus: tournament.tournamentType === "paid" ? "confirmed" : "confirmed",
      joinedAt:      new Date(),
    })

    tournament.filledSlots += 1

    await tournament.save()

    // Update user's tournamentsJoined count
    await User.updateOne(
      { uid: session.uid },
      { $inc: { tournamentsJoined: 1 } }
    )

    return NextResponse.json({
      success: true,
      message: "Successfully joined the tournament",
      slotsRemaining: tournament.totalSlots - tournament.filledSlots,
    })
  } catch (err) {
    console.error("POST /api/tournaments/join error:", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}