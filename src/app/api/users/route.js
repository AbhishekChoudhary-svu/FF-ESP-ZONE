import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import { User } from "@/models/users.model"
import { verifySession } from "@/lib/session"
import { checkApiLimit } from "@/lib/rateLimit"

export async function GET(req) {
  try {
    const raw = req.cookies.get("session")?.value
    if (!raw) return logoutResponse("Unauthorized")

    const session = verifySession(raw)
    if (!session?.uid) return logoutResponse("Invalid session")

    await dbConnect()
    const user = await User.findOne({ uid: session.uid }).lean()

    if (!user) return logoutResponse("User not found")
    if (user.isBanned) return logoutResponse("Account banned")

    // Session version check — catches role changes, bans, forced logouts
    if ((user.sessionVersion ?? 1) !== session.sessionVersion) {
      return logoutResponse("Session expired")
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        provider: user.provider,
        username: user.username,
        bio: user.bio,
        ffUid: user.ffUid,
        rank: user.rank,
        playstyle: user.playstyle,
        tournamentsJoined: user.tournamentsJoined,
        role: user.role,
        plan: user.plan,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
    })
  } catch (err) {
    console.error("GET /api/users error:", err)
    return logoutResponse("Invalid session")
  }
}

export async function PATCH(req) {
  const ip = req.headers.get("x-forwarded-for") ??
             req.headers.get("x-real-ip") ??
             "unknown"

  try {
    // Rate limit — max 10 profile updates per 10 minutes per IP
    await checkApiLimit(ip)

    const raw = req.cookies.get("session")?.value
    if (!raw) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const session = verifySession(raw)
    if (!session?.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await dbConnect()

    // Verify session version before allowing any update
    const currentUser = await User.findOne({ uid: session.uid }).lean()
    if (!currentUser) return logoutResponse("User not found")
    if (currentUser.isBanned) return logoutResponse("Account banned")
    if ((currentUser.sessionVersion ?? 1) !== session.sessionVersion) {
      return logoutResponse("Session expired")
    }

    const body = await req.json()

    const allowedUpdates = ["username", "bio", "ffUid", "rank", "playstyle"]
    const updates = {}
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) updates[key] = body[key]
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    // Validate field lengths before updating
    if (updates.username && (updates.username.length < 3 || updates.username.length > 30)) {
      return NextResponse.json({ error: "Username must be 3-30 characters" }, { status: 400 })
    }
    if (updates.bio && updates.bio.length > 160) {
      return NextResponse.json({ error: "Bio must be under 160 characters" }, { status: 400 })
    }

    // Check username/ffUid uniqueness if being updated
    if (updates.username || updates.ffUid) {
      const conflict = await User.findOne({
        $and: [
          { uid: { $ne: session.uid } }, // not the current user
          {
            $or: [
              updates.username ? { username: updates.username } : null,
              updates.ffUid ? { ffUid: updates.ffUid } : null,
            ].filter(Boolean),
          },
        ],
      })
      if (conflict) {
        return NextResponse.json(
          { error: "Username or Free Fire UID already taken" },
          { status: 409 }
        )
      }
    }

    const user = await User.findOneAndUpdate(
      { uid: session.uid },
      { $set: updates },
      { new: true }
    )

    if (!user) return logoutResponse("User not found")

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        username: user.username,
        bio: user.bio,
        ffUid: user.ffUid,
        rank: user.rank,
        playstyle: user.playstyle,
        plan: user.plan,
        role: user.role,
      },
    })
  } catch (err) {
    if (err.message?.includes("Too many")) {
      return NextResponse.json({ error: err.message }, { status: 429 })
    }
    console.error("PATCH /api/users error:", err)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}

function logoutResponse(message) {
  const res = NextResponse.json({ error: message }, { status: 401 })
  res.cookies.set({
    name: "session",
    value: "",
    path: "/",
    httpOnly: true,
    maxAge: 0,
  })
  return res
}