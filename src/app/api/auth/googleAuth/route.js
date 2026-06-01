import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import { User } from "@/models/users.model"
import { signSession } from "@/lib/session"
import { verifyGoogleToken } from "@/lib/googleVerify"

export async function POST(req) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: "ID token missing" }, { status: 400 })
    }

    
const decoded = await verifyGoogleToken(idToken);


    await dbConnect()

    let user = await User.findOne({ uid: decoded.uid })

    if (!user) {
      user = await User.create({
        uid: decoded.uid,
        email: decoded.email,
        username: decoded.name || decoded.email.split("@")[0],
        ffUid: decoded.uid,
        emailVerified: true,
        role: "user",
        plan: "basic",
        provider: "google",
        sessionVersion: 1,
        password: "",
      })
    }

    const session = {
      uid: user.uid,
      email: user.email,
      sessionVersion: user.sessionVersion ?? 1,
    }

    const res = NextResponse.json({ success: true })

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
  } catch (error) {
    console.error("Google Auth Error:", error)
    return NextResponse.json({ error: error.message || "Google auth failed" }, { status: 401 })
  }
}