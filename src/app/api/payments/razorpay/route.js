/**
 * /api/payments/razorpay/route.js
 *
 * POST → Create a Razorpay order (called before checkout opens)
 * PUT  → Verify payment signature after checkout succeeds, then join tournament
 * GET  → Fetch payment list for a tournament (organizer/admin only)
 */

import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import { Tournament } from "@/models/tournaments.model";
import { Player } from "@/models/players.model";
import { Team } from "@/models/teams.model";
import { User } from "@/models/users.model";
import { Payment } from "@/models/payment.model";
import { verifySession } from "@/lib/session";

// ── Razorpay singleton ───────────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Auth helper ──────────────────────────────────────────────────────────────
async function auth(req) {
  const raw = req.cookies.get("session")?.value;
  if (!raw) return {};
  const session = verifySession(raw);
  if (!session?.uid) return {};
  const user = await User.findOne({ uid: session.uid }).lean();
  return { session, user };
}

// ── Shared: build members list from tournament + player ──────────────────────
async function buildMembers(tournament, player) {
  let members = [];
  let teamRef = null;

  if (tournament.teamMode === "Squad") {
    if (!player.isCaptain) {
      return { error: "Only the team captain can register", status: 403 };
    }
    const team = await Team.findById(player.teamId).populate("players");
    if (!team || team.players.length < 4) {
      return { error: "Your team needs at least 4 players", status: 400 };
    }
    members = team.players.slice(0, 4).map((p) => p._id);
    teamRef = team._id;
    return { members, teamRef };
  }

  if (tournament.teamMode === "Duo") {
    if (!player.isCaptain) {
      return { error: "Only the team captain can register a duo", status: 403 };
    }
    const team = await Team.findById(player.teamId).populate("players");
    if (!team || team.players.length < 2) {
      return { error: "Your team needs at least 2 players for duo", status: 400 };
    }
    members = team.players.slice(0, 2).map((p) => p._id);
    teamRef = team._id;
    return { members, teamRef };
  }

  // Solo
  return { members: [player._id], teamRef: null };
}

// ────────────────────────────────────────────────────────────────────────────
// POST — create Razorpay order
// Body: { tournamentId }
// ────────────────────────────────────────────────────────────────────────────
export async function POST(req) {
  try {
    await dbConnect();

    const { session, user } = await auth(req);
    if (!session || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tournamentId } = await req.json();
    if (!tournamentId) {
      return NextResponse.json({ error: "tournamentId required" }, { status: 400 });
    }

    const [tournament, player] = await Promise.all([
      Tournament.findById(tournamentId).lean(),
      Player.findOne({ userId: user._id }).lean(),
    ]);

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }
    if (!player) {
      return NextResponse.json({ error: "Player profile required" }, { status: 403 });
    }
    if (tournament.tournamentType !== "paid") {
      return NextResponse.json(
        { error: "This tournament is free — no payment required" },
        { status: 400 }
      );
    }
    if (tournament.status !== "upcoming") {
      return NextResponse.json({ error: "Registration is closed" }, { status: 400 });
    }
    if (tournament.filledSlots >= tournament.totalSlots) {
      return NextResponse.json({ error: "Tournament is full" }, { status: 400 });
    }

    // Guard: already joined
    const alreadyJoined = tournament.participants.some(
      (p) => p.player?.toString() === player._id.toString()
    );
    if (alreadyJoined) {
      return NextResponse.json(
        { error: "You already joined this tournament" },
        { status: 409 }
      );
    }

    // Guard: idempotency — return existing pending order instead of creating a new one
    // This prevents a user from spamming POST and accumulating zombie orders
    const existingPayment = await Payment.findOne({
      tournamentId,
      userId: user._id,
      status: "created",
    });
    if (existingPayment) {
      // Verify the existing order is still valid on Razorpay side
      try {
        const existingOrder = await razorpay.orders.fetch(existingPayment.orderId);
        if (existingOrder.status === "created") {
          return NextResponse.json({
            success: true,
            orderId: existingPayment.orderId,
            amount: existingPayment.amount,
            currency: "INR",
            keyId: process.env.RAZORPAY_KEY_ID,
            tournamentName: tournament.name,
            entryFee: tournament.entryFee,
            prefill: { name: user.username ?? "", email: user.email ?? "" },
          });
        }
      } catch {
        // existing order gone on Razorpay; fall through and create a fresh one
      }
    }

    const amountPaise = Math.round(tournament.entryFee * 100);

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `ffez_${Date.now()}`,
      notes: {
        tournamentId: String(tournamentId),
        userId: String(user._id),
        playerId: String(player._id),
      },
    });

    await Payment.create({
      orderId: order.id,
      tournamentId,
      userId: user._id,
      amount: amountPaise,
      status: "created",
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: amountPaise,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
      tournamentName: tournament.name,
      entryFee: tournament.entryFee,
      prefill: { name: user.username ?? "", email: user.email ?? "" },
    });
  } catch (err) {
    console.error("POST /api/payments/razorpay error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

// ────────────────────────────────────────────────────────────────────────────
// PUT — verify signature + join tournament atomically
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, tournamentId }
// ────────────────────────────────────────────────────────────────────────────
export async function PUT(req) {
  try {
    await dbConnect();

    const { session, user } = await auth(req);
    if (!session || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      tournamentId,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !tournamentId) {
      return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
    }

    // ── 1. Verify HMAC-SHA256 signature ──────────────────────────────────────
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed — signature mismatch" },
        { status: 400 }
      );
    }

    // ── 2. Idempotency: check if this payment was already processed ──────────
    const existingPayment = await Payment.findOne({ orderId: razorpay_order_id });
    if (existingPayment?.status === "captured") {
      // Already processed — return success so UI doesn't get stuck
      const t = await Tournament.findById(tournamentId).lean();
      return NextResponse.json({
        success: true,
        message: "Payment already verified and joined!",
        paymentId: razorpay_payment_id,
        slotsRemaining: t ? t.totalSlots - t.filledSlots : 0,
      });
    }

    // ── 3. Verify payment was actually CAPTURED by Razorpay ──────────────────
    let rzpPayment;
    try {
      rzpPayment = await razorpay.payments.fetch(razorpay_payment_id);
    } catch {
      return NextResponse.json(
        { error: "Could not fetch payment details from Razorpay" },
        { status: 502 }
      );
    }

    if (rzpPayment.status !== "captured") {
      // Mark payment as failed in our DB
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: "failed", paymentId: razorpay_payment_id }
      );
      return NextResponse.json(
        { error: `Payment not captured — status: ${rzpPayment.status}` },
        { status: 400 }
      );
    }

    // Replay-attack guard: ensure payment belongs to this order
    if (rzpPayment.order_id !== razorpay_order_id) {
      return NextResponse.json(
        { error: "Payment order ID mismatch — possible replay attack" },
        { status: 400 }
      );
    }

    // ── 4. Load tournament + player (single round trip) ─────────────────────
    const [tournament, player] = await Promise.all([
      Tournament.findById(tournamentId),
      Player.findOne({ userId: user._id }).populate("teamId"),
    ]);

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }
    if (!player) {
      return NextResponse.json({ error: "Player profile not found" }, { status: 403 });
    }

    // Verify amount matches entry fee (anti-tampering)
    const expectedPaise = Math.round(tournament.entryFee * 100);
    if (rzpPayment.amount !== expectedPaise) {
      return NextResponse.json(
        { error: "Payment amount does not match entry fee" },
        { status: 400 }
      );
    }

    // ── 5. Re-check guards (race conditions) ────────────────────────────────
    if (tournament.status !== "upcoming") {
      return NextResponse.json({ error: "Registration is now closed" }, { status: 400 });
    }
    if (tournament.filledSlots >= tournament.totalSlots) {
      return NextResponse.json({ error: "Tournament just filled up" }, { status: 400 });
    }

    const alreadyJoined = tournament.participants.some(
      (p) => p.player?.toString() === player._id.toString()
    );
    if (alreadyJoined) {
      // Payment succeeded but player was already joined (webhook may have done it first)
      // Still update Payment record and return success
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: "captured", paymentId: razorpay_payment_id }
      );
      return NextResponse.json({
        success: true,
        message: "Already joined — payment recorded!",
        paymentId: razorpay_payment_id,
        slotsRemaining: tournament.totalSlots - tournament.filledSlots,
      });
    }

    // ── 6. Build members list ────────────────────────────────────────────────
    const membersResult = await buildMembers(tournament, player);
    if (membersResult.error) {
      return NextResponse.json(
        { error: membersResult.error },
        { status: membersResult.status }
      );
    }
    const { members, teamRef } = membersResult;

    // For squad/duo: check no member already in tournament
    if (tournament.teamMode !== "Solo") {
      const memberIds = members.map(String);
      const dupMember = tournament.participants.some((p) =>
        p.members.some((m) => memberIds.includes(m.toString()))
      );
      if (dupMember) {
        return NextResponse.json(
          { error: "A team member already joined this tournament" },
          { status: 409 }
        );
      }
    }

    // ── 7. Add participant + update Payment atomically ───────────────────────
    tournament.participants.push({
      player: player._id,
      team: teamRef,
      members,
      paymentId: razorpay_payment_id,
      paymentStatus: "confirmed",
      joinedAt: new Date(),
    });
    tournament.filledSlots += 1;

    await Promise.all([
      tournament.save(),
      Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: "captured", paymentId: razorpay_payment_id }
      ),
      User.updateOne({ _id: user._id }, { $inc: { tournamentsJoined: 1 } }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Payment verified and successfully joined!",
      paymentId: razorpay_payment_id,
      slotsRemaining: tournament.totalSlots - tournament.filledSlots,
    });
  } catch (err) {
    console.error("PUT /api/payments/razorpay error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

// ────────────────────────────────────────────────────────────────────────────
// GET — fetch payment status for a tournament (organizer / admin only)
// Query: ?tournamentId=xxx
// ────────────────────────────────────────────────────────────────────────────
export async function GET(req) {
  try {
    await dbConnect();

    const { session, user } = await auth(req);
    if (!session || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tournamentId = searchParams.get("tournamentId");
    if (!tournamentId) {
      return NextResponse.json({ error: "tournamentId required" }, { status: 400 });
    }

    const tournament = await Tournament.findById(tournamentId)
      .populate({
        path: "participants.player",
        select: "avatar",
        populate: { path: "userId", select: "username" },
      })
      .lean();

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const isPrivileged = ["admin", "moderator"].includes(user.role);
    const isOrg = tournament.organizer.toString() === user._id.toString();
    if (!isOrg && !isPrivileged) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payments = tournament.participants.map((p) => ({
      participant: p.player?.userId?.username ?? "Unknown",
      paymentId: p.paymentId,
      paymentStatus: p.paymentStatus,
      joinedAt: p.joinedAt,
      amount: tournament.entryFee,
    }));

    const totalCollected =
      payments.filter((p) => p.paymentStatus === "confirmed").length *
      tournament.entryFee;

    return NextResponse.json({
      success: true,
      payments,
      totalCollected,
      currency: "INR",
    });
  } catch (err) {
    console.error("GET /api/payments/razorpay error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}