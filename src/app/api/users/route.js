import { NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebaseAdmin"
import dbConnect from "@/lib/dbConnect"
import { User } from "@/models/users.model"


export async function GET(req) {
  const res = NextResponse.next()

  try {
    const sessionCookie = req.cookies.get("session")?.value
    if (!sessionCookie) {
      return logoutResponse("Unauthorized")
    }

    const session = JSON.parse(sessionCookie)

    
    try {
      await adminAuth.getUser(session.uid)
    } catch {
      return logoutResponse("Firebase user not found")
    }

 
    await dbConnect()
    const user = await User.findOne({ uid: session.uid }).lean()

    if (!user) {
      return logoutResponse("User not found in database")
    }

  
    if (user.isBanned) {
      return logoutResponse("Account banned")
    }

   
    return NextResponse.json({
      success: true,
      user: {
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
    return logoutResponse("Invalid session")
  }
}


export async function PATCH(req) {
  try {
    const sessionCookie = req.cookies.get("session")?.value
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie)
    const body = await req.json()

    const allowedUpdates = [
      "username",
      "bio",
      "ffUid",
      "rank",
      "playstyle",
    ]

    const updates = {}
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updates[key] = body[key]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      )
    }

    await dbConnect()

    const user = await User.findOneAndUpdate(
      { uid: session.uid },
      { $set: updates },
      { new: true }
    )

    if (!user) {
      return logoutResponse("User not found")
    }

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
    console.error("Update user error:", err)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}


function logoutResponse(message) {
  const res = NextResponse.json(
    { error: message },
    { status: 401 }
  )

  res.cookies.set({
    name: "session",
    value: "",
    path: "/",
    maxAge: 0,
  })

  return res
}
