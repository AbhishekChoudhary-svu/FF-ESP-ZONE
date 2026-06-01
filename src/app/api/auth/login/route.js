import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect"
import { User } from "@/models/users.model"
import { signSession } from "@/lib/session"
import { checkLoginLimit, resetLoginLimit } from "@/lib/rateLimit"

export async function POST(req) {
  const ip = req.headers.get("x-forwarded-for") ?? 
             req.headers.get("x-real-ip") ?? 
             "unknown"

  try {
    // 1. Rate limit check first — before any DB query
    await checkLoginLimit(ip)

    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    await dbConnect()

    // 2. Always run bcrypt even if user not found — fixes timing attack
    //    Attacker can't tell if email exists by measuring response time
    const user = await User.findOne({ email })
    const fakeHash = "$2a$12$zHBBgCGnGBCghkAlbFLOXuPDDSWaFRlBpb6py9DfwFY1AiPXsVFBe"
    const passwordMatch = await bcrypt.compare(
      password,
      user?.password || fakeHash  // always runs bcrypt, same timing either way
    )

    if (!user || !passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    if (user.provider === "google") {
      return NextResponse.json(
        { error: "This account uses Google sign-in" },
        { status: 401 }
      )
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email first" },
        { status: 403 }
      )
    }

    if (user.isBanned) {
      return NextResponse.json(
        { error: "Account banned" },
        { status: 403 }
      )
    }

    // 3. Successful login — reset rate limit for this IP
    await resetLoginLimit(ip)
    await User.updateOne({ uid: user.uid }, { lastLoginAt: new Date() })

    const session = {
      uid: user.uid,
      email: user.email,
      sessionVersion: user.sessionVersion ?? 1,
    }

    const res = NextResponse.json({
      success: true,
      message: "Login successful",
      user: { uid: user.uid, email: user.email, username: user.username },
    })

    res.cookies.set({
      name: "session",
      value: signSession(session),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 3,
      sameSite: "lax",
    })

    return res
  } catch (err) {
    // Rate limit error
    if (err.message.includes("Too many attempts")) {
      return NextResponse.json(
        { error: err.message },
        { status: 429 }
      )
    }
    console.error("Login error:", err)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}