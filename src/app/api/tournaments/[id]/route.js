import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Tournament } from "@/models/tournaments.model";
import { Player } from "@/models/players.model";
import { User } from "@/models/users.model";
import { verifySession } from "@/lib/session";
import { sendNotification } from "@/lib/notificationService";

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Resolve the caller's User document from the session.
 * session.uid is a Firebase UID (string). User._id is a Mongo ObjectId.
 * Always look up by uid field, never by _id.
 */
async function resolveUser(req) {
  const raw = req.cookies.get("session")?.value;
  if (!raw) return { session: null, user: null };
  const session = verifySession(raw);
  if (!session?.uid) return { session: null, user: null };
  const user = await User.findOne({ uid: session.uid }).lean();
  return { session, user };
}

/**
 * Check whether the caller is the organizer of a tournament.
 * tournament.organizer is a Mongo ObjectId; user._id is also a Mongo ObjectId.
 * Convert both to strings for a safe comparison.
 */
function isOrganizerOf(tournament, user) {
  if (!tournament || !user) return false;
  return tournament.organizer.toString() === user._id.toString();
}

// ─── GET single tournament ───────────────────────────────────────────────────
export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const tournament = await Tournament.findById(id)
      .populate("organizer", "username role uid")
      .populate({
        path: "participants.player",
        select: "avatar inGameRole isCaptain userId",
        populate: { path: "userId", select: "username ffUid uid" },
      })
      .populate({
        path: "participants.team",
        select: "teamName tag logo",
      })
      .populate({
        path: "participants.members",
        select: "avatar inGameRole isCaptain",
        populate: { path: "userId", select: "username" },
      })
      .lean();

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 },
      );
    }

    const { session, user } = await resolveUser(req);

    // Check if caller is a participant (by player userId.uid OR member chain)
    const isParticipant =
      !!session &&
      tournament.participants.some((p) => {
        const playerUid = p.player?.userId?.uid;
        return playerUid && playerUid === session.uid;
      });

    const isPrivileged = user && ["admin", "moderator"].includes(user.role);
    const isOrg = user && isOrganizerOf(tournament, user);

    // Hide room credentials from non-participants / non-organizers
    if (!isParticipant && !isOrg && !isPrivileged) {
      tournament.roomId = null;
      tournament.roomPassword = null;
    }

    return NextResponse.json({ success: true, tournament });
  } catch (err) {
    console.error("GET /api/tournaments/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ─── PATCH tournament ────────────────────────────────────────────────────────
export async function PATCH(req, { params }) {
  try {
    await dbConnect()
 
    const { session, user } = await resolveUser(req)
    if (!session || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
 
    const { id } = await params
    const tournament = await Tournament.findById(id)
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 })
    }
 
    const isPrivileged = ["admin", "moderator"].includes(user.role)
    const isOrg        = isOrganizerOf(tournament, user)
 
    if (!isOrg && !isPrivileged) {
      return NextResponse.json(
        { error: "Not authorized to update this tournament" },
        { status: 403 }
      )
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
      results,
    } = body
 
    const updates = {}
 
    // ── Room credentials ───────────────────────────────────────────────────
    if (roomId !== undefined) {
      updates.roomId        = roomId
      updates.roomPassword  = roomPassword
      updates.roomPublishedAt = new Date()
 
      // Notify all participants that room credentials are live
      const fullTournament = await Tournament.findById(id)
        .populate({ path: "participants.player", select: "userId" })
        .lean()
 
      if (fullTournament) {
        const userIds = fullTournament.participants
          .map((p) => p.player?.userId)
          .filter(Boolean)
 
        await Promise.all(
          userIds.map((uid) =>
            sendNotification({
              userId:  uid,
              title:   "Room Credentials Released 🔑",
              message: `Room ID and password are now live for ${fullTournament.name}. Check tournament details.`,
              type:    "room",
              data:    { tournamentId: fullTournament._id },
            })
          )
        )
      }
    }
 
    // ── Status transitions ─────────────────────────────────────────────────
    if (status) {
      if (isPrivileged) {
        updates.status = status
      } else {
        const validTransitions = {
          draft:     ["upcoming", "cancelled"],
          upcoming:  ["ongoing",  "cancelled"],
          ongoing:   ["completed","cancelled"],
          completed: [],
          cancelled: [],
        }
 
        if (!validTransitions[tournament.status]?.includes(status)) {
          return NextResponse.json({ error: "Invalid status transition" }, { status: 400 })
        }
 
        updates.status = status
      }
    }
 
    // ── Publish / unpublish ────────────────────────────────────────────────
    if (isPublished !== undefined) {
      if (tournament.tournamentType === "paid" && !isPrivileged) {
        return NextResponse.json(
          { error: "Only admin or moderator can publish paid tournaments" },
          { status: 403 }
        )
      }
      updates.isPublished = isPublished
      if (isPublished && tournament.status === "draft") {
        updates.status = "upcoming"
      }
    }
 
    // ── Editable basic fields (draft / upcoming only) ──────────────────────
    if (["draft", "upcoming"].includes(tournament.status)) {
      if (name         !== undefined) updates.name         = name
      if (description  !== undefined) updates.description  = description
      if (rules        !== undefined) updates.rules        = rules
      if (startDate)                  updates.startDate    = new Date(startDate)
      if (endDate)                    updates.endDate      = new Date(endDate)
      if (registrationDeadline)       updates.registrationDeadline = new Date(registrationDeadline)
      if (prizePool    !== undefined) updates.prizePool    = prizePool
      if (prizeDistribution)          updates.prizeDistribution = prizeDistribution
      if (bannerImage  !== undefined) updates.bannerImage  = bannerImage
    }
 
    // ── Match results ──────────────────────────────────────────────────────
    if (results && Array.isArray(results)) {
      if (!isOrg && !isPrivileged) {
        return NextResponse.json(
          { error: "Only the organizer can submit results" },
          { status: 403 }
        )
      }
 
      updates.results = results.map((r) => ({
        placement: Number(r.placement) || 0,
        player:    r.player  || null,
        team:      r.team    || null,
        kills:     Number(r.kills) || 0,
        prize:     Number(r.prize) || 0,
      }))
 
      // Update placement + kills on each participant sub-doc
      for (const r of results) {
        await Tournament.updateOne(
          { _id: params.id, "participants.player": r.player },
          {
            $set: {
              "participants.$.placement": Number(r.placement) || 0,
              "participants.$.kills":     Number(r.kills)     || 0,
            },
          }
        )
      }
 
      // Update each player's lifetime stats + send result notification
      for (const r of results) {
        if (!r.player) continue
 
        // Lifetime stat update (your existing code)
        await Player.findByIdAndUpdate(r.player, {
          $inc:  { "stats.matchesPlayed": 1, "stats.kills": Number(r.kills) || 0 },
          $push: {
            tournamentHistory: {
              tournamentName: tournament.name,
              kills:          Number(r.kills)     || 0,
              placement:      Number(r.placement) || 0,
              prize:          Number(r.prize)     || 0,
              date:           new Date(),
            },
          },
        })
 
        // Notify each player their result is live
        const playerDoc = await Player.findById(r.player).select("userId").lean()
        if (playerDoc?.userId) {
          await sendNotification({
            userId:  playerDoc.userId,
            title:   "Match Results Published 🏆",
            message: `${tournament.name} is over — you placed #${r.placement} with ${r.kills} kills`,
            type:    "result",
            data: {
              tournamentId: tournament._id,
              placement:    r.placement,
              kills:        r.kills,
              prize:        r.prize,
            },
          })
        }
      }
 
      // Force completed when results are submitted
      updates.status = "completed"
    }
 
    // ── Save & return ──────────────────────────────────────────────────────
    const updated = await Tournament.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: false }
    )
      .populate("organizer", "username role uid")
      .populate({
        path:     "participants.player",
        select:   "avatar inGameRole isCaptain",
        populate: { path: "userId", select: "username ffUid" },
      })
      .populate("participants.team", "teamName tag logo")
 
    return NextResponse.json({
      success:    true,
      message:    "Tournament updated successfully",
      tournament: updated,
    })
  } catch (err) {
    console.error("PATCH /api/tournaments/[id] error:", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}


// ─── DELETE tournament ───────────────────────────────────────────────────────
// Organizer can delete their own draft/upcoming/cancelled tournaments.
// Admin can delete anything except ongoing.
export async function DELETE(req, { params }) {
  try {
    await dbConnect();

    const { session, user } = await resolveUser(req);
    if (!session || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 },
      );
    }

    const isPrivileged = ["admin", "moderator"].includes(user.role);
    const isOrg = isOrganizerOf(tournament, user);

    if (!isOrg && !isPrivileged) {
      return NextResponse.json(
        { error: "Only the organizer or an admin can delete this tournament" },
        { status: 403 },
      );
    }

    if (tournament.status === "ongoing") {
      return NextResponse.json(
        { error: "Cannot delete an ongoing tournament — cancel it first" },
        { status: 400 },
      );
    }

    // Non-admins (i.e. captains) can only delete their own draft/upcoming/cancelled
    if (
      !isPrivileged &&
      !["draft", "upcoming", "cancelled"].includes(tournament.status)
    ) {
      return NextResponse.json(
        { error: "You can only delete tournaments that haven't started yet" },
        { status: 403 },
      );
    }

    await Tournament.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Tournament deleted successfully",
    });
  } catch (err) {
    console.error("DELETE /api/tournaments/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 },
    );
  }
}
