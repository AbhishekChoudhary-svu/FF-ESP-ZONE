/**
 * /api/payments/razorpay/route.js
 *
 * POST /api/payments/razorpay
 *   → Create a Razorpay order (called before checkout opens)
 *
 * PUT  /api/payments/razorpay
 *   → Verify payment signature after checkout succeeds
 *   → Then immediately joins the player into the tournament
 *
 * Environment variables needed (set in .env.local):
 *   RAZORPAY_KEY_ID      – your Razorpay Key ID
 *   RAZORPAY_KEY_SECRET  – your Razorpay Key Secret
 */

import { NextResponse }  from "next/server"
import Razorpay          from "razorpay"
import crypto            from "crypto"
import dbConnect         from "@/lib/dbConnect"
import { Tournament }    from "@/models/tournaments.model"
import { Player }        from "@/models/players.model"
import { Team }          from "@/models/teams.model"
import { User }          from "@/models/users.model"
import { verifySession } from "@/lib/session"

// ── Razorpay singleton ───────────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// ── Auth helper ──────────────────────────────────────────────────────────────
async function auth(req) {
  const raw = req.cookies.get("session")?.value
  if (!raw) return {}
  const session = verifySession(raw)
  if (!session?.uid) return {}
  const user = await User.findOne({ uid: session.uid }).lean()
  return { session, user }
}

// ────────────────────────────────────────────────────────────────────────────
// POST — create Razorpay order
// Body: { tournamentId }
// ────────────────────────────────────────────────────────────────────────────
export async function POST(req) {
  try {
    await dbConnect()

    const { session, user } = await auth(req)
    if (!session || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { tournamentId } = await req.json()
    if (!tournamentId) {
      return NextResponse.json({ error: "tournamentId required" }, { status: 400 })
    }

    const tournament = await Tournament.findById(tournamentId).lean()
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 })
    }

    if (tournament.tournamentType !== "paid") {
      return NextResponse.json({ error: "This tournament is free — no payment required" }, { status: 400 })
    }

    if (tournament.status !== "upcoming") {
      return NextResponse.json({ error: "Registration is closed" }, { status: 400 })
    }

    if (tournament.filledSlots >= tournament.totalSlots) {
      return NextResponse.json({ error: "Tournament is full" }, { status: 400 })
    }

    // Check player hasn't already joined
    const player = await Player.findOne({ userId: user._id }).lean()
    if (!player) {
      return NextResponse.json({ error: "Player profile required" }, { status: 403 })
    }

    const alreadyJoined = tournament.participants.some(
      (p) => p.player?.toString() === player._id.toString()
    )
    if (alreadyJoined) {
      return NextResponse.json({ error: "You already joined this tournament" }, { status: 409 })
    }

    // Amount is in paise (1 INR = 100 paise)
    const amountPaise = Math.round(tournament.entryFee * 100)

    const order = await razorpay.orders.create({
      amount:          amountPaise,
      currency:        "INR",
      receipt:         `tourn_${tournamentId}_${user._id}`,
      notes: {
        tournamentId:  tournamentId,
        userId:        user._id.toString(),
        playerId:      player._id.toString(),
      },
    })

    return NextResponse.json({
      success:      true,
      orderId:      order.id,
      amount:       amountPaise,
      currency:     "INR",
      keyId:        process.env.RAZORPAY_KEY_ID,
      tournamentName: tournament.name,
      entryFee:     tournament.entryFee,
      prefill: {
        name:  user.username ?? "",
        email: user.email    ?? "",
      },
    })
  } catch (err) {
    console.error("POST /api/payments/razorpay error:", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}

// ────────────────────────────────────────────────────────────────────────────
// PUT — verify signature + join tournament atomically
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, tournamentId }
// ────────────────────────────────────────────────────────────────────────────
export async function PUT(req) {
  try {
    await dbConnect()

    const { session, user } = await auth(req)
    if (!session || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      tournamentId,
    } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !tournamentId) {
      return NextResponse.json({ error: "Missing payment fields" }, { status: 400 })
    }

    // ── 1. Verify HMAC-SHA256 signature ─────────────────────────────────────
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed — signature mismatch" },
        { status: 400 }
      )
    }

    // ── 2. Load tournament + player ──────────────────────────────────────────
    const [tournament, player] = await Promise.all([
      Tournament.findById(tournamentId),
      Player.findOne({ userId: user._id }).populate("teamId"),
    ])

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 })
    }
    if (!player) {
      return NextResponse.json({ error: "Player profile not found" }, { status: 403 })
    }

    // Guard: still open?
    if (tournament.status !== "upcoming") {
      return NextResponse.json({ error: "Registration is now closed" }, { status: 400 })
    }
    if (tournament.filledSlots >= tournament.totalSlots) {
      return NextResponse.json({ error: "Tournament just filled up" }, { status: 400 })
    }

    // Guard: duplicate check
    const alreadyJoined = tournament.participants.some(
      (p) => p.player?.toString() === player._id.toString()
    )
    if (alreadyJoined) {
      return NextResponse.json({ error: "You already joined this tournament" }, { status: 409 })
    }

    // ── 3. Build members list (same logic as join route) ────────────────────
    let members = []
    let teamRef = null

    if (tournament.teamMode === "Squad") {
      if (!player.isCaptain) {
        return NextResponse.json(
          { error: "Only the team captain can register" },
          { status: 403 }
        )
      }
      const team = await Team.findById(player.teamId).populate("players")
      if (!team || team.players.length < 4) {
        return NextResponse.json(
          { error: "Your team needs at least 4 players" },
          { status: 400 }
        )
      }
      members = team.players.slice(0, 4).map((p) => p._id)
      teamRef = team._id

      const memberIds  = members.map(String)
      const dupMember  = tournament.participants.some((p) =>
        p.members.some((m) => memberIds.includes(m.toString()))
      )
      if (dupMember) {
        return NextResponse.json(
          { error: "A team member already joined this tournament" },
          { status: 409 }
        )
      }
    } else if (tournament.teamMode === "Duo") {
      if (!player.isCaptain) {
        return NextResponse.json(
          { error: "Only the team captain can register a duo" },
          { status: 403 }
        )
      }
      const team = await Team.findById(player.teamId).populate("players")
      if (!team || team.players.length < 2) {
        return NextResponse.json(
          { error: "Your team needs at least 2 players" },
          { status: 400 }
        )
      }
      members = team.players.slice(0, 2).map((p) => p._id)
      teamRef = team._id
    } else {
      // Solo
      members = [player._id]
    }

    // ── 4. Add participant ───────────────────────────────────────────────────
    tournament.participants.push({
      player:        player._id,
      team:          teamRef,
      members,
      paymentId:     razorpay_payment_id,
      paymentStatus: "confirmed",
      joinedAt:      new Date(),
    })
    tournament.filledSlots += 1
    await tournament.save()

    // Increment user's joinedCount
    await User.updateOne({ _id: user._id }, { $inc: { tournamentsJoined: 1 } })

    return NextResponse.json({
      success:        true,
      message:        "Payment verified and successfully joined!",
      paymentId:      razorpay_payment_id,
      slotsRemaining: tournament.totalSlots - tournament.filledSlots,
    })
  } catch (err) {
    console.error("PUT /api/payments/razorpay error:", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}

// ────────────────────────────────────────────────────────────────────────────
// GET — fetch payment status for a tournament (for organizer dashboard)
// Query: ?tournamentId=xxx
// ────────────────────────────────────────────────────────────────────────────
export async function GET(req) {
  try {
    await dbConnect()

    const { session, user } = await auth(req)
    if (!session || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const tournamentId     = searchParams.get("tournamentId")
    if (!tournamentId) {
      return NextResponse.json({ error: "tournamentId required" }, { status: 400 })
    }

    const tournament = await Tournament.findById(tournamentId)
      .populate({
        path: "participants.player",
        select: "avatar",
        populate: { path: "userId", select: "username" },
      })
      .lean()

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 })
    }

    const isPrivileged = ["admin", "moderator"].includes(user.role)
    const isOrg        = tournament.organizer.toString() === user._id.toString()

    if (!isOrg && !isPrivileged) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const payments = tournament.participants.map((p) => ({
      participant:   p.player?.userId?.username ?? "Unknown",
      paymentId:     p.paymentId,
      paymentStatus: p.paymentStatus,
      joinedAt:      p.joinedAt,
      amount:        tournament.entryFee,
    }))

    const totalCollected = payments.filter((p) => p.paymentStatus === "confirmed").length * tournament.entryFee

    return NextResponse.json({
      success:        true,
      payments,
      totalCollected,
      currency:       "INR",
    })
  } catch (err) {
    console.error("GET /api/payments/razorpay error:", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}