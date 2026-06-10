/**
 * /api/payments/razorpay/webhook/route.js
 *
 * Handles Razorpay webhook events. This is a safety net:
 *   - If the client-side PUT verify flow completes successfully, the webhook
 *     will see the payment already "captured" in our DB and skip gracefully.
 *   - If the user closes the browser before the PUT fires, the webhook will
 *     still join them into the tournament automatically.
 *
 * Set Webhook Secret in Razorpay Dashboard → Settings → Webhooks
 * Env var: RAZORPAY_WEBHOOK_SECRET
 *
 * Events subscribed:
 *   payment.captured
 *   payment.failed
 */

import crypto from "crypto";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import dbConnect from "@/lib/dbConnect";
import { Payment } from "@/models/payment.model";
import { Tournament } from "@/models/tournaments.model";
import { Player } from "@/models/players.model";
import { Team } from "@/models/teams.model";
import { User } from "@/models/users.model";
import { sendNotification } from "@/lib/notificationService";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Shared: build members list ───────────────────────────────────────────────
async function buildMembers(tournament, player) {
  if (tournament.teamMode === "Squad") {
    if (!player.isCaptain) return { error: "Only team captain can register" };
    const team = await Team.findById(player.teamId).populate("players");
    if (!team || team.players.length < 4) return { error: "Team needs 4+ players" };
    return { members: team.players.slice(0, 4).map((p) => p._id), teamRef: team._id };
  }
  if (tournament.teamMode === "Duo") {
    if (!player.isCaptain) return { error: "Only team captain can register duo" };
    const team = await Team.findById(player.teamId).populate("players");
    if (!team || team.players.length < 2) return { error: "Team needs 2+ players" };
    return { members: team.players.slice(0, 2).map((p) => p._id), teamRef: team._id };
  }
  return { members: [player._id], teamRef: null };
}

// ── payment.captured handler ─────────────────────────────────────────────────
async function handlePaymentCaptured(entity) {
  const { id: paymentId, order_id: orderId, notes } = entity;

  // 1. Find our Payment record
  const payment = await Payment.findOne({ orderId });
  if (!payment) {
    console.warn(`[webhook] payment.captured: no Payment record for orderId=${orderId}`);
    return;
  }

  // 2. Idempotency: already processed
  if (payment.status === "captured") {
    console.log(`[webhook] payment.captured: already captured, skipping. orderId=${orderId}`);
    return;
  }

  // 3. Update Payment record
  payment.status = "captured";
  payment.paymentId = paymentId;
  await payment.save();

  // 4. Attempt to join the tournament
  const { tournamentId, userId } = payment;

  const [tournament, user] = await Promise.all([
    Tournament.findById(tournamentId),
    User.findById(userId),
  ]);

  if (!tournament || !user) {
    console.error(`[webhook] payment.captured: tournament or user not found for orderId=${orderId}`);
    return;
  }

  // Guard: already joined (PUT verify flow may have done this already)
  const player = await Player.findOne({ userId: user._id }).populate("teamId");
  if (!player) {
    console.error(`[webhook] payment.captured: no player profile for userId=${userId}`);
    return;
  }

  const alreadyJoined = tournament.participants.some(
    (p) => p.player?.toString() === player._id.toString()
  );
  if (alreadyJoined) {
    console.log(`[webhook] payment.captured: player already joined, skipping. orderId=${orderId}`);
    return;
  }

  // Guard: tournament still open
  if (tournament.status !== "upcoming") {
    console.warn(`[webhook] payment.captured: tournament not upcoming. orderId=${orderId}`);
    return;
  }
  if (tournament.filledSlots >= tournament.totalSlots) {
    console.warn(`[webhook] payment.captured: tournament full. orderId=${orderId}`);
    return;
  }

  // Verify amount
  const expectedPaise = Math.round(tournament.entryFee * 100);
  if (entity.amount !== expectedPaise) {
    console.error(`[webhook] payment.captured: amount mismatch. expected=${expectedPaise}, got=${entity.amount}`);
    return;
  }

  // Build members
  const membersResult = await buildMembers(tournament, player);
  if (membersResult.error) {
    console.error(`[webhook] payment.captured: buildMembers error: ${membersResult.error}`);
    return;
  }
  const { members, teamRef } = membersResult;

  // Squad/Duo duplicate member check
  if (tournament.teamMode !== "Solo") {
    const memberIds = members.map(String);
    const dupMember = tournament.participants.some((p) =>
      p.members.some((m) => memberIds.includes(m.toString()))
    );
    if (dupMember) {
      console.warn(`[webhook] payment.captured: duplicate team member. orderId=${orderId}`);
      return;
    }
  }

  // Join
  tournament.participants.push({
    player: player._id,
    team: teamRef,
    members,
    paymentId,
    paymentStatus: "confirmed",
    joinedAt: new Date(),
  });
  tournament.filledSlots += 1;

  await Promise.all([
    tournament.save(),
    User.updateOne({ _id: user._id }, { $inc: { tournamentsJoined: 1 } }),
  ]);
  await sendNotification({
  userId:  user._id,
  title:   "Payment Confirmed ✅",
  message: `Entry fee paid for ${tournament.name}. You're registered!`,
  type:    "payment",
  data:    { tournamentId: tournament._id },
})

  console.log(`[webhook] payment.captured: player joined tournament. orderId=${orderId}`);
}

// ── payment.failed handler ───────────────────────────────────────────────────
async function handlePaymentFailed(entity) {
  const { id: paymentId, order_id: orderId } = entity;

  const updated = await Payment.findOneAndUpdate(
    { orderId },
    { status: "failed", paymentId },
    { new: true }
  );

  if (!updated) {
    console.warn(`[webhook] payment.failed: no Payment record for orderId=${orderId}`);
    return;
  }

  console.log(`[webhook] payment.failed: marked failed. orderId=${orderId}`);
}

// ── POST ─────────────────────────────────────────────────────────────────────
export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  // Verify webhook signature
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  if (signature !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await dbConnect();

  try {
    switch (event.event) {
      case "payment.captured":
        await handlePaymentCaptured(event.payload.payment.entity);
        break;

      case "payment.failed":
        await handlePaymentFailed(event.payload.payment.entity);
        break;

      default:
        console.log("[webhook] Unhandled Razorpay event:", event.event);
    }
  } catch (err) {
    // Always return 200 to Razorpay so it doesn't retry endlessly.
    // Log the real error for debugging.
    console.error("[webhook] Handler error:", err);
  }

  // Razorpay expects 200 OK regardless — it retries on non-200
  return NextResponse.json({ ok: true });
}