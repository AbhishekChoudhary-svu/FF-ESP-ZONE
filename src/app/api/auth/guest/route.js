import crypto from "crypto"
import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import { User } from "@/models/users.model"
import { signSession } from "@/lib/session"
import { checkGuestLimit } from "@/lib/rateLimit"

export async function POST(req) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"

  try {
    await checkGuestLimit(ip)
    await dbConnect()

    // Clean up guest accounts older than 24 hours
    await User.deleteMany({
      provider: "guest",
      createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    })

    const uid = `guest_${crypto.randomUUID()}`

    const user = await User.create({
      uid,
      username: `Guest_${crypto.randomUUID().slice(0, 8)}`,
      provider: "guest",
      role: "guest",
      emailVerified: true,
      plan: "basic",
      sessionVersion: 1,
      isBanned: false,
    })

    const session = {
      uid: user.uid,
      email: null,
      sessionVersion: 1,
    }

    const res = NextResponse.json({ success: true })

    res.cookies.set({
      name: "session",
      value: signSession(session),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    })

    return res
  } catch (err) {
    if (err.message?.includes("Too many")) {
      return NextResponse.json({ error: err.message }, { status: 429 })
    }
    console.error("Guest login error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}